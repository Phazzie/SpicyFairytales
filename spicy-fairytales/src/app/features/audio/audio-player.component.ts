/**
 * Comprehensive audio player for synthesized story playback with streaming audio support.
 * 
 * Final consumer component in the audio generation pipeline that orchestrates voice synthesis
 * and provides playback controls. Handles streaming audio chunks, playback state management,
 * and user interactions for story audio consumption.
 * 
 * INPUT: ParsedStory from StoryStore, VoiceAssignments from VoiceStore, streaming AudioChunks
 * OUTPUT: Audio playback, user control events, playback state updates
 * DEPENDENCIES: VoiceService for synthesis, StoryStore and VoiceStore for content and assignments
 * INTEGRATIONS: Final pipeline stage consuming all previous components' outputs
 * FEATURES: Play/pause controls, streaming audio handling, chunk-based playback, error recovery
 * PERFORMANCE: Efficient audio buffer management, progressive playback during synthesis
 */
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
    this.subscription = this.voice.synthesize(this.stories.parsed()!, assignments).subscribe({
      next: async (chunk) => {
        this.segments.update((arr) => [...arr, chunk.text ?? `Segment ${arr.length + 1}`])
        const buf = await this.decodeOrSilence(chunk.audio)
        this.buffers.push(buf)
      },
      error: (e) => {
        this.status.set('Synthesis failed')
        this.generating.set(false)
      },
      complete: () => {
        this.status.set(`Ready: ${this.buffers.length} segments`)
        this.generating.set(false)
      },
    })
  }

  private async decodeOrSilence(data: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.ac) this.ac = new AudioContext()
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
    if (!this.ac || this.buffers.length === 0) return
    this.stop()
    // Concatenate buffers by scheduling sequentially
    let when = this.ac.currentTime
    this.buffers.forEach((buf, i) => {
      const src = this.ac!.createBufferSource()
      src.buffer = buf
      src.connect(this.ac!.destination)
      src.start(when)
      const duration = buf.duration
      // Update current index at start of each segment
      setTimeout(() => this.currentIndex.set(i), Math.max(0, (when - this.ac!.currentTime) * 1000))
      this.source = src
      when += duration
    })
    // Flip playing flag approximately
    const total = this.buffers.reduce((s, b) => s + b.duration, 0)
    this.playing.set(true)
    setTimeout(() => this.stop(), total * 1000)
  }

  pause() {
    this.ac?.suspend()
    this.playing.set(false)
  }

  stop() {
    if (this.ac && this.ac.state !== 'closed') {
      this.ac.close()
      this.ac = undefined
    }
    this.source?.stop()
    this.source = undefined
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
