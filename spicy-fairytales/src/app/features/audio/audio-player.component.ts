import { Component, Inject, OnDestroy, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StoryStore } from '../../stores/story.store'
import { VoiceStore } from '../../stores/voice.store'
import { VOICE_SERVICE } from '../../shared/tokens'
import type { VoiceAssignment, VoiceService } from '../../shared/contracts'

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="audio">
      <header class="controls">
        <button (click)="generate()" [disabled]="!canGenerate() || generating()">{{ generating() ? 'Synthesizing…' : 'Generate Audio' }}</button>
        <button (click)="play()" [disabled]="!readyToPlay() || playing()">Play</button>
        <button (click)="pause()" [disabled]="!playing()">Pause</button>
        <button (click)="stop()" [disabled]="!readyToPlay()">Stop</button>
        <span class="muted" *ngIf="status()">{{ status() }}</span>
      </header>
      <ol class="segments" *ngIf="segments().length">
        <li *ngFor="let s of segments(); let i = index" [class.active]="i === currentIndex()">{{ s }}</li>
      </ol>
    </section>
  `,
  styles: [
    `
      .controls { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
      .muted { color: #666; font-style: italic; }
      .segments { margin-top: 0.5rem; display: grid; gap: 0.25rem; }
      .segments .active { font-weight: 600; }
    `,
  ],
})
export class AudioPlayerComponent implements OnDestroy {
  protected generating = signal(false)
  protected playing = signal(false)
  protected status = signal('')
  protected segments = signal<string[]>([])
  protected currentIndex = signal(0)

  private ac?: AudioContext
  private buffers: AudioBuffer[] = []
  private source?: AudioBufferSourceNode
  private subscription?: { unsubscribe: () => void }
  private timers: number[] = []

  constructor(
    private stories: StoryStore,
    private voices: VoiceStore,
    @Inject(VOICE_SERVICE) private voice: VoiceService,
  ) {}

  canGenerate() {
    return !!this.stories.parsed()
  }

  readyToPlay() {
    return this.buffers.length > 0
  }

  async generate() {
    if (!this.stories.parsed()) return
    this.cleanupAudio()
    this.generating.set(true)
    this.segments.set([])
    this.currentIndex.set(0)

    // Build assignments array from store
    const map = this.voices.assignments()
    const assignments: VoiceAssignment[] = Object.keys(map).map((k) => ({ character: k, voiceId: map[k] }))

    // Browser-only check
    if (typeof window === 'undefined') {
      this.status.set('Audio synthesis not available on server')
      this.generating.set(false)
      return
    }

    this.ac = this.ac ?? new AudioContext()

    // Subscribe to synthesis stream
    this.subscription?.unsubscribe()
    try {
      this.subscription = this.voice.synthesize(this.stories.parsed()!, assignments).subscribe({
        next: async (chunk) => {
          this.segments.update((arr) => [...arr, chunk.text ?? `Segment ${arr.length + 1}`])
          const buf = await this.decodeOrSilence(chunk.audio)
          this.buffers.push(buf)
        },
        error: (e) => {
          this.status.set(`Synthesis failed${e?.message ? `: ${e.message}` : ''}`)
          this.generating.set(false)
        },
        complete: () => {
          this.status.set(`Ready: ${this.buffers.length} segments`)
          this.generating.set(false)
        },
      })
    } catch (e: any) {
      this.status.set(`Synthesis failed${e?.message ? `: ${e.message}` : ''}`)
      this.generating.set(false)
    }
  }

  private async decodeOrSilence(data: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.ac) {
      const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext
      this.ac = new Ctor()
    }
    if (!this.ac) {
      throw new Error('AudioContext not available')
    }
    try {
      if (data && data.byteLength > 0) {
        return await this.ac.decodeAudioData(data.slice(0))
      }
    } catch {}
    // Create 0.5s silent buffer as fallback
    const sr = this.ac.sampleRate
    const buffer = this.ac.createBuffer(1, Math.floor(sr * 0.5), sr)
    return buffer
  }

  play() {
    if (this.buffers.length === 0) return
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext
    this.ac = this.ac ?? new Ctor()
    if (this.ac && this.ac.state === 'suspended') {
      this.ac.resume()
    }
    if (!this.ac) return
    // Concatenate buffers by scheduling sequentially
    const ac = this.ac
    let when = ac.currentTime
    this.buffers.forEach((buf, i) => {
      const src = ac.createBufferSource()
      src.buffer = buf
      src.connect(ac.destination)
      src.start(when)
      const duration = buf.duration
      // Update current index at start of each segment
      this.timers.push(setTimeout(() => this.currentIndex.set(i), Math.max(0, (when - ac.currentTime) * 1000)) as any)
      this.source = src
      when += duration
    })
    this.playing.set(true)
    // Stop precisely when the final source ends (robust to pause/resume)
    const last = this.source
    if (last) last.onended = () => this.stop()
  }

  pause() {
    this.ac?.suspend()
    this.playing.set(false)
  }

  stop() {
    // Stop sources first
    this.source?.stop()
    this.source = undefined
    // Clear scheduled timers
    this.timers?.forEach((id) => clearTimeout(id))
    this.timers = []
    // Then close context
    if (this.ac && this.ac.state !== 'closed') {
      this.ac.close()
      this.ac = undefined
    }
    this.playing.set(false)
  }

  private cleanupAudio() {
    this.stop()
    this.buffers = []
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
    this.cleanupAudio()
  }
}
