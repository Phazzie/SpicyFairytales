import { Component, Inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Observable } from 'rxjs'
import { StoryFormComponent } from '../features/story/story-form.component'
import { StoryDisplayComponent } from '../features/story/story-display.component'
import { CharacterVoicesComponent } from '../features/voices/character-voices.component'
import { AudioPlayerComponent } from '../features/voice/audio-player.component'
import { ExportPanelComponent } from '../features/export/export-panel.component'
import { SPEAKER_PARSER, STORY_SERVICE, VOICE_SERVICE } from '../shared/tokens'
import type { StoryOptions, StoryService, VoiceAssignment, VoiceService, AudioChunk, SpeakerParser } from '../shared/contracts'
import { StoryStore } from '../stores/story.store'
import { VoiceStore } from '../stores/voice.store'
import { env } from '../shared/env'
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component'
import { ToastService } from '../shared/toast.service'

@Component({
  selector: 'app-generate-page',
  standalone: true,
  imports: [CommonModule, StoryFormComponent, StoryDisplayComponent, CharacterVoicesComponent, AudioPlayerComponent, ExportPanelComponent, LoadingSkeletonComponent],
  template: `
    <div class="layout">
      <!-- API Test Section -->
      <div class="api-test-section">
        <h3>🚀 API Integration Test</h3>
        <p>Test the full pipeline with real APIs (Grok + ElevenLabs)</p>
        <div class="api-mode-indicator">
          <span class="mode-badge" [class.real]="!isMockMode" [class.mock]="isMockMode">
            {{ isMockMode ? '🎭 Mock Mode' : '🔥 Real APIs' }}
          </span>
        </div>
        <button
          class="test-api-btn"
          (click)="testRealAPIs()"
          [disabled]="isTesting"
        >
          {{ isTesting ? 'Testing APIs...' : '🔥 Test Real APIs' }}
        </button>
        <div class="test-status" *ngIf="testStatus">
          <p [class]="testStatus.type">{{ testStatus.message }}</p>
        </div>
      </div>

      <div class="story-section">
        <app-story-form (optionsSubmit)="onGenerate($event, form)" #form></app-story-form>

        <div class="story-content" *ngIf="!isGenerating; else storyLoading">
          <app-story-display [append]="latestChunk"></app-story-display>
        </div>
        <ng-template #storyLoading>
          <div class="loading-section">
            <h4>📝 Generating your story...</h4>
            <app-loading-skeleton type="text" [lines]="8"></app-loading-skeleton>
          </div>
        </ng-template>
      </div>
      <div class="actions-section" *ngIf="store.currentText()">
        <div class="actions">
          <button
            (click)="parseCurrent()"
            [disabled]="isParsing"
            class="btn btn-secondary"
          >
            {{ isParsing ? '🗣️ Parsing...' : '🗣️ Parse Speakers' }}
          </button>
          <span class="muted" *ngIf="store.parsed()">
            Parsed {{ store.parsed()?.segments?.length || 0 }} segments / {{ store.parsed()?.characters?.length || 0 }} characters
          </span>
        </div>
      </div>

      <div class="parsing-section" *ngIf="isParsing">
        <h4>🎭 Analyzing dialogue and characters...</h4>
        <app-loading-skeleton type="card" [lines]="3"></app-loading-skeleton>
      </div>
      <div class="voice-section" *ngIf="store.parsed()">
        <app-character-voices />

        <div class="actions">
          <button
            (click)="synthesize()"
            [disabled]="isSynthesizing"
            class="btn btn-primary"
          >
            {{ isSynthesizing ? '🔊 Synthesizing...' : '🔊 Synthesize Audio' }}
          </button>
        </div>
      </div>

      <div class="synthesis-section" *ngIf="isSynthesizing">
        <h4>🎵 Creating voice audio...</h4>
        <app-loading-skeleton type="card" [lines]="2"></app-loading-skeleton>
      </div>

      <div class="audio-section" *ngIf="audioUrl">
        <app-audio-player [src]="audioUrl" />
      </div>
  <app-export-panel />
    </div>
  `,
  styles: [
    `
      .layout { display: grid; gap: 1rem; max-width: 900px; margin: 2rem auto; }
      .actions { display: flex; gap: 0.75rem; align-items: center; }
      .muted { color: #666; font-style: italic; }

      .api-test-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .api-test-section h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .api-test-section p {
        margin: 0 0 1rem 0;
        opacity: 0.9;
        font-size: 0.9rem;
      }

      .test-api-btn {
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .test-api-btn:hover:not(:disabled) {
        background: #ff5252;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .test-api-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .test-status {
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 6px;
        font-weight: 500;
      }

      .api-mode-indicator {
        margin-bottom: 1rem;
      }

      .mode-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .mode-badge.real {
        background: rgba(255, 107, 107, 0.2);
        color: #ff6b6b;
        border: 1px solid rgba(255, 107, 107, 0.3);
      }

      .mode-badge.mock {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
        border: 1px solid rgba(255, 193, 7, 0.3);
      }
    `,
  ],
})
export class GeneratePageComponent {
  latestChunk: string | null = null
  private sub?: { unsubscribe: () => void }
  audioUrl: string | null = null
  isTesting = false
  testStatus: { type: string; message: string } | null = null
  isMockMode = env.useMocks

  // Loading states
  isGenerating = false
  isParsing = false
  isSynthesizing = false

  constructor(
    @Inject(STORY_SERVICE) private story: StoryService,
    public store: StoryStore,
    @Inject(SPEAKER_PARSER) private parser: SpeakerParser,
    @Inject(VOICE_SERVICE) private voice: VoiceService,
    private voices: VoiceStore,
    private toastService: ToastService
  ) {}

  onGenerate(options: StoryOptions, form: { resetSubmitting: () => void }) {
    this.isGenerating = true
    this.toastService.info('📝 Generating Story', 'Creating your custom story with AI...')

    if (this.sub) this.sub.unsubscribe()
    this.latestChunk = ''
    this.store.reset()

    this.sub = this.story.generateStory(options).subscribe({
      next: (chunk) => {
        this.latestChunk = chunk
        this.store.append(chunk)
      },
      error: (error) => {
        this.isGenerating = false
        this.toastService.error('❌ Story Generation Failed', error.message || 'Failed to generate story')
        form.resetSubmitting()
      },
      complete: () => {
        this.isGenerating = false
        this.toastService.success('✅ Story Generated', 'Your story is ready! Parse speakers to continue.')
        form.resetSubmitting()
      }
    })
  }

  async parseCurrent() {
    const text = this.store.currentText()
    if (!text) return

    this.isParsing = true
    this.toastService.info('🗣️ Parsing Speakers', 'Analyzing dialogue and identifying characters...')

    try {
      const parsed = await this.parser.parseStory(text)
      this.store.setParsed(parsed)
      this.toastService.success(
        '✅ Speakers Parsed',
        `Found ${parsed.segments?.length || 0} segments and ${parsed.characters?.length || 0} characters`
      )
    } catch (error: unknown) {
      this.toastService.error('❌ Speaker Parsing Failed', error instanceof Error ? error.message : 'Failed to parse speakers')
    } finally {
      this.isParsing = false
    }
  }

  synthesize() {
    const parsed = this.store.parsed()
    if (!parsed) return

    this.isSynthesizing = true
    this.toastService.info('🔊 Synthesizing Audio', 'Creating voice audio for your story...')

    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl)
      this.audioUrl = null
    }

    const assigns: VoiceAssignment[] = Object.entries(this.voices.assignments()).map(([character, voiceId]) => ({ character, voiceId }))
    const narratorVoice = this.voices.narratorVoice() || undefined
    const buffers: ArrayBuffer[] = []

    const sub = this.voice.synthesize(parsed, assigns, narratorVoice).subscribe({
      next: (chunk) => buffers.push(chunk.audio),
      error: (error) => {
        this.isSynthesizing = false
        this.toastService.error('❌ Audio Synthesis Failed', error.message || 'Failed to create audio')
        sub.unsubscribe()
      },
      complete: () => {
        this.isSynthesizing = false
        if (buffers.length === 0) {
          this.toastService.error('❌ No Audio Generated', 'No audio data was received')
          return
        }

        const total = buffers.reduce((acc, b) => acc + b.byteLength, 0)
        const merged = new Uint8Array(total)
        let offset = 0
        for (const buf of buffers) {
          merged.set(new Uint8Array(buf), offset)
          offset += buf.byteLength
        }
        const blob = new Blob([merged.buffer], { type: 'audio/mpeg' })
        this.audioUrl = URL.createObjectURL(blob)

        this.toastService.success('✅ Audio Ready', 'Your story is now ready to listen!')
      }
    })
  }

  async testRealAPIs() {
    this.isTesting = true
    this.testStatus = { type: 'info', message: '🚀 Starting API integration test...' }

    try {
      // Step 1: Generate a story
      this.testStatus = { type: 'info', message: '📝 Generating story with Grok...' }
      await this.testStoryGeneration()

      // Step 2: Parse speakers
      this.testStatus = { type: 'info', message: '🗣️ Parsing speakers with Grok...' }
      await this.testSpeakerParsing()

      // Step 3: Synthesize audio
      this.testStatus = { type: 'info', message: '🔊 Synthesizing audio with ElevenLabs...' }
      await this.testAudioSynthesis()

      this.testStatus = { type: 'success', message: '✅ All APIs working perfectly! Full pipeline test successful.' }

    } catch (error: unknown) {
      this.testStatus = { type: 'error', message: `❌ API Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    } finally {
      this.isTesting = false
    }
  }

  private async testStoryGeneration(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.sub) this.sub.unsubscribe()
      this.latestChunk = ''
      this.store.reset()

      const testOptions: StoryOptions = {
        title: 'The Enchanted Forest',
        genre: 'fantasy',
        tone: 'magical',
        length: 'short',
        themes: ['magic', 'adventure'],
        prompt: 'A short magical adventure story for testing API integration'
      }

      this.sub = this.story.generateStory(testOptions).subscribe({
        next: (chunk) => {
          this.latestChunk = chunk
          this.store.append(chunk)
        },
        error: (error) => reject(new Error(`Story generation failed: ${error.message}`)),
        complete: () => resolve()
      })

      // Timeout after 30 seconds
      setTimeout(() => reject(new Error('Story generation timed out')), 30000)
    })
  }

  private async testSpeakerParsing(): Promise<void> {
    const text = this.store.currentText()
    if (!text) throw new Error('No story text to parse')

    const parsed = await this.parser.parseStory(text)
    if (!parsed.segments || parsed.segments.length === 0) {
      throw new Error('Speaker parsing returned no segments')
    }

    this.store.setParsed(parsed)
  }

  private async testAudioSynthesis(): Promise<void> {
    const parsed = this.store.parsed()
    if (!parsed) throw new Error('No parsed story for audio synthesis')

    return new Promise((resolve, reject) => {
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl)
        this.audioUrl = null
      }

      const assigns: VoiceAssignment[] = Object.entries(this.voices.assignments()).map(([character, voiceId]) => ({ character, voiceId }))
      const narratorVoice = this.voices.narratorVoice() || undefined
      const buffers: ArrayBuffer[] = []

      const sub = this.voice.synthesize(parsed, assigns, narratorVoice).subscribe({
        next: (chunk) => buffers.push(chunk.audio),
        error: (error) => reject(new Error(`Audio synthesis failed: ${error.message}`)),
        complete: () => {
          if (buffers.length === 0) {
            reject(new Error('No audio data received'))
            return
          }

          const total = buffers.reduce((acc, b) => acc + b.byteLength, 0)
          const merged = new Uint8Array(total)
          let offset = 0
          for (const buf of buffers) {
            merged.set(new Uint8Array(buf), offset)
            offset += buf.byteLength
          }
          const blob = new Blob([merged.buffer], { type: 'audio/mpeg' })
          this.audioUrl = URL.createObjectURL(blob)
          resolve()
        }
      })

      // Timeout after 60 seconds
      setTimeout(() => reject(new Error('Audio synthesis timed out')), 60000)
    })
  }
}
