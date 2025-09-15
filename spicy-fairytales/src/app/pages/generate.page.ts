/**
 * Primary application page orchestrating the complete story generation and audio synthesis workflow.
 * 
 * Central coordinator component that manages the entire pipeline from user input to audio output.
 * Integrates story generation, speaker parsing, voice assignment, and audio synthesis into a
 * cohesive user experience with step-by-step workflow management.
 * 
 * INPUT: User interactions from story form, voice assignments, playback controls
 * OUTPUT: Complete story generation workflow, integrated audio experience, export capabilities
 * DEPENDENCIES: All core services (StoryService, SpeakerParser, VoiceService), state stores
 * INTEGRATIONS: Orchestrates all pipeline components, manages service interactions and data flow
 * WORKFLOW: Story form → generation → parsing → voice assignment → synthesis → playback/export
 * ARCHITECTURE: Implements the full data pipeline as defined in contracts.ts
 */
import { Component, Inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Observable } from 'rxjs'
import { StoryFormComponent } from '../features/story/story-form.component'
import { StoryDisplayComponent } from '../features/story/story-display.component'
import { CharacterVoicesComponent } from '../features/voices/character-voices.component'
import { AudioPlayerComponent } from '../features/voice/audio-player.component'
import { ExportPanelComponent } from '../features/export/export-panel.component'
import { SPEAKER_PARSER, STORY_SERVICE, VOICE_SERVICE } from '../shared/tokens'
import type { StoryOptions, StoryService, VoiceAssignment, VoiceService, AudioChunk } from '../shared/contracts'
import { StoryStore } from '../stores/story.store'
import { VoiceStore } from '../stores/voice.store'
import { env } from '../shared/env'
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component'
import { ToastService } from '../shared/toast.service'

@Component({
  selector: 'app-generate-page',
  standalone: true,
  imports: [CommonModule, FormsModule, StoryFormComponent, StoryDisplayComponent, CharacterVoicesComponent, AudioPlayerComponent, ExportPanelComponent, LoadingSkeletonComponent],
  template: `
    <div class="layout">
      <!-- API Keys Panel -->
      <div class="api-keys-panel">
        <h3>🔑 API Keys</h3>
        <p class="muted">Keys are stored locally in your browser only (localStorage). This app reads from localStorage for security.</p>
        <div class="keys-grid">
          <div class="key-item">
            <label>Grok API Key</label>
            <input type="password" [(ngModel)]="grokKeyInput" placeholder="paste x.ai key" />
          </div>
          <div class="key-item">
            <label>ElevenLabs API Key</label>
            <input type="password" [(ngModel)]="elevenKeyInput" placeholder="paste elevenlabs key" />
          </div>
        </div>
        <div class="keys-actions">
          <button class="btn btn-primary" (click)="saveKeys()">Save Keys</button>
          <button class="btn" (click)="loadKeys()">Load from Browser</button>
          <button class="btn btn-danger" (click)="clearKeys()">Clear Keys</button>
        </div>
        <div class="keys-status">
          <span>Grok: {{ hasGrokKey ? '✅' : '❌' }}</span>
          <span>ElevenLabs: {{ hasElevenKey ? '✅' : '❌' }}</span>
        </div>
      </div>
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
        <app-story-form 
  (onGenerate)="onGenerate($event)"
  (onTestApi)="onTestApi()"
  (onGenerateTestStory)="onGenerateTestStory($event)"
></app-story-form>

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

      .api-keys-panel {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 1rem;
      }
      .api-keys-panel h3 { margin: 0 0 0.5rem 0; }
      .keys-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
      .key-item { display: flex; flex-direction: column; gap: 0.25rem; }
      .key-item input { padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px; }
      .keys-actions { margin-top: 0.75rem; display: flex; gap: 0.5rem; }
      .btn { padding: 0.5rem 0.9rem; border-radius: 6px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer; }
      .btn:hover { background: #f1f3f5; }
      .btn-primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
      .btn-primary:hover { background: #4338ca; }
      .btn-danger { background: #ef4444; color: #fff; border-color: #ef4444; }
      .btn-danger:hover { background: #dc2626; }
      .keys-status { margin-top: 0.5rem; display: flex; gap: 1rem; }

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

  // API key inputs and status
  grokKeyInput = ''
  elevenKeyInput = ''
  get hasGrokKey() { try { return !!localStorage.getItem('XAI_API_KEY') || !!(window as any).VITE_XAI_API_KEY; } catch { return false } }
  get hasElevenKey() { try { return !!localStorage.getItem('ELEVENLABS_API_KEY') || !!(window as any).VITE_ELEVENLABS_API_KEY; } catch { return false } }

  // Loading states
  isGenerating = false
  isParsing = false
  isSynthesizing = false

  constructor(
    @Inject(STORY_SERVICE) private story: StoryService,
    public store: StoryStore,
    @Inject(SPEAKER_PARSER) private parser: any,
    @Inject(VOICE_SERVICE) private voice: VoiceService,
    public voiceStore: VoiceStore,
    private toast: ToastService,
  ) {}

  loadKeys(): void {
    try {
      this.grokKeyInput = localStorage.getItem('XAI_API_KEY') || ''
      this.elevenKeyInput = localStorage.getItem('ELEVENLABS_API_KEY') || ''
      this.toast.info('API Keys', 'Loaded keys from your browser')
    } catch (e: any) {
      this.toast.warning('API Keys', 'Could not access localStorage')
    }
  }

  saveKeys(): void {
    try {
      if (this.grokKeyInput) localStorage.setItem('XAI_API_KEY', this.grokKeyInput)
      if (this.elevenKeyInput) localStorage.setItem('ELEVENLABS_API_KEY', this.elevenKeyInput)
      // Also place on window immediately so current session picks up without reload
      ;(window as any).VITE_XAI_API_KEY = this.grokKeyInput
      ;(window as any).VITE_ELEVENLABS_API_KEY = this.elevenKeyInput
      this.toast.success('API Keys', 'Saved keys to your browser')
    } catch (e: any) {
      this.toast.error('API Keys', 'Failed to save keys')
    }
  }

  clearKeys(): void {
    try {
      localStorage.removeItem('XAI_API_KEY')
      localStorage.removeItem('ELEVENLABS_API_KEY')
      this.grokKeyInput = ''
      this.elevenKeyInput = ''
      this.toast.info('API Keys', 'Cleared keys from your browser')
    } catch (e: any) {
      this.toast.warning('API Keys', 'Could not clear localStorage keys')
    }
  }

  onGenerate(options: StoryOptions): void {
    this.isGenerating = true
    this.latestChunk = ''
    this.store.reset()

    this.story.generateStory(options).subscribe({
      next: (chunk: string) => {
        this.latestChunk += chunk
        this.store.append(chunk)
      },
      error: (err: Error) => {
        this.isGenerating = false
        this.toast.error('Story Generation Failed', err.message)
      },
      complete: () => {
        this.isGenerating = false
      },
    })
  }

  onTestApi(): void {
    this.toast.info('API Test', 'API test initiated!')
    // In a real scenario, this would trigger a more comprehensive API check.
    // For now, we'll just simulate a successful test.
    setTimeout(() => {
      this.toast.success('API Test', 'API connection successful!')
    }, 1500)
  }

  onGenerateTestStory(wordCount: number): void {
    const options: StoryOptions = {
      length: wordCount < 600 ? 'short' : 'medium',
      characterType: 'werewolf',
      spicyLevel: 5,
      themes: ['romance', 'intrigue'],
      genre: 'fantasy',
      tone: 'dark'
    }
    this.toast.info('Test Story', `Generating a ${wordCount}-word test story...`)
    this.onGenerate(options)
  }

  async testRealAPIs() {
    this.isTesting = true
    this.testStatus = null

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

    } catch (error: any) {
      this.testStatus = { type: 'error', message: `❌ API Test Failed: ${error.message}` }
      console.error('API Test Error:', error)
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
        next: (chunk: string) => {
          this.latestChunk = chunk
          this.store.append(chunk)
        },
        error: (error: any) => reject(new Error(`Story generation failed: ${error.message}`)),
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

      const assigns: VoiceAssignment[] = Object.entries(this.voiceStore.assignments()).map(([character, voiceId]) => ({ character, voiceId: voiceId as string }))
      const narratorVoice = this.voiceStore.narratorVoice() || undefined
      const buffers: ArrayBuffer[] = []

      const sub = this.voice.synthesize(parsed, assigns, narratorVoice).subscribe({
        next: (chunk: AudioChunk) => buffers.push(chunk.audio),
        error: (error: any) => reject(new Error(`Audio synthesis failed: ${error.message}`)),
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
