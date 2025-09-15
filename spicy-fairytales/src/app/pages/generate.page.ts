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
  imports: [CommonModule, StoryFormComponent, StoryDisplayComponent, CharacterVoicesComponent, AudioPlayerComponent, ExportPanelComponent, LoadingSkeletonComponent],
  template: `
    <div class="modern-layout">
      <!-- Hero Section with Floating API Test Card -->
      <div class="hero-section animate-fade-in-up">
        <div class="container">
          <div class="hero-content text-center">
            <h1 class="hero-title">✨ Create Your Spicy FairyTale</h1>
            <p class="hero-subtitle">Transform your imagination into immersive audio stories with AI magic</p>
          </div>
          
          <!-- Floating API Test Card -->
          <div class="api-test-card card-floating animate-fade-in-scale animate-delay-200">
            <div class="api-test-content">
              <h3>🚀 API Integration Test</h3>
              <p>Experience the full pipeline with real AI APIs</p>
              <div class="api-mode-indicator">
                <span class="mode-badge" [class.real]="!isMockMode" [class.mock]="isMockMode">
                  {{ isMockMode ? '🎭 Mock Mode' : '🔥 Real APIs' }}
                </span>
              </div>
              <button
                class="test-api-btn btn btn-primary"
                (click)="testRealAPIs()"
                [disabled]="isTesting"
              >
                <span *ngIf="!isTesting">🔥 Test Real APIs</span>
                <span *ngIf="isTesting" class="loading-content">
                  <span class="loading-spinner"></span>
                  Testing APIs...
                </span>
              </button>
              <div class="test-status-card" *ngIf="testStatus">
                <p [class]="testStatus.type">{{ testStatus.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="container">
        <div class="content-grid">
          <!-- Story Generation Section -->
          <section class="story-section animate-fade-in-up animate-delay-300">
            <div class="section-card card">
              <app-story-form (optionsSubmit)="onGenerate($event, form)" #form></app-story-form>
            </div>

            <!-- Story Display -->
            <div class="story-display-section" *ngIf="!isGenerating; else storyLoading">
              <div class="story-display-card card" *ngIf="store.currentText()">
                <app-story-display [append]="latestChunk"></app-story-display>
              </div>
            </div>
            
            <ng-template #storyLoading>
              <div class="loading-section card animate-pulse">
                <div class="loading-header">
                  <h4>📝 Generating your story...</h4>
                  <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <app-loading-skeleton type="text" [lines]="8"></app-loading-skeleton>
              </div>
            </ng-template>
          </section>

          <!-- Actions Section -->
          <section class="actions-section" *ngIf="store.currentText()">
            <div class="action-card card animate-fade-in-up">
              <div class="action-header">
                <h4>🎭 Next Steps</h4>
              </div>
              <div class="action-buttons">
                <button
                  (click)="parseCurrent()"
                  [disabled]="isParsing"
                  class="btn btn-secondary action-btn"
                >
                  <span *ngIf="!isParsing">🗣️ Parse Speakers</span>
                  <span *ngIf="isParsing" class="loading-content">
                    <span class="loading-spinner"></span>
                    Parsing...
                  </span>
                </button>
                <div class="status-indicator" *ngIf="store.parsed()">
                  <span class="badge badge-success">
                    {{ store.parsed()?.segments?.length || 0 }} segments • {{ store.parsed()?.characters?.length || 0 }} characters
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Parsing Section -->
          <section class="parsing-section" *ngIf="isParsing">
            <div class="parsing-card card card-gradient animate-pulse">
              <h4>🎭 Analyzing dialogue and characters...</h4>
              <app-loading-skeleton type="card" [lines]="3"></app-loading-skeleton>
            </div>
          </section>

          <!-- Voice Assignment Section -->
          <section class="voice-section" *ngIf="store.parsed()">
            <div class="voice-card card animate-fade-in-up">
              <app-character-voices />
              
              <div class="synthesis-actions">
                <button
                  (click)="synthesize()"
                  [disabled]="isSynthesizing"
                  class="btn btn-primary synthesis-btn"
                >
                  <span *ngIf="!isSynthesizing">🔊 Synthesize Audio</span>
                  <span *ngIf="isSynthesizing" class="loading-content">
                    <span class="loading-spinner"></span>
                    Synthesizing...
                  </span>
                </button>
              </div>
            </div>
          </section>

          <!-- Synthesis Section -->
          <section class="synthesis-section" *ngIf="isSynthesizing">
            <div class="synthesis-card card card-gradient animate-pulse">
              <h4>🎵 Creating voice audio...</h4>
              <div class="synthesis-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <p>Bringing your characters to life...</p>
              </div>
              <app-loading-skeleton type="card" [lines]="2"></app-loading-skeleton>
            </div>
          </section>

          <!-- Audio Player Section -->
          <section class="audio-section" *ngIf="audioUrl">
            <div class="audio-card card animate-fade-in-scale">
              <div class="audio-header">
                <h4>🎧 Your Story is Ready!</h4>
                <p>Experience your personalized fairy tale</p>
              </div>
              <app-audio-player [src]="audioUrl" />
            </div>
          </section>

          <!-- Export Section -->
          <section class="export-section">
            <div class="export-card card animate-fade-in-up animate-delay-500">
              <app-export-panel />
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modern-layout {
        min-height: 100vh;
        padding: var(--space-xl) 0;
      }

      /* Hero Section */
      .hero-section {
        position: relative;
        padding: var(--space-2xl) 0;
        margin-bottom: var(--space-2xl);
        overflow: hidden;
      }

      .hero-content {
        margin-bottom: var(--space-2xl);
      }

      .hero-title {
        font-size: 3.5rem;
        font-weight: 900;
        margin-bottom: var(--space-md);
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.1;
      }

      .hero-subtitle {
        font-size: 1.25rem;
        color: var(--text-secondary);
        font-weight: 500;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
      }

      /* Floating API Test Card */
      .api-test-card {
        max-width: 500px;
        margin: 0 auto;
        background: var(--card-bg);
        backdrop-filter: var(--glass-backdrop);
        position: relative;
        overflow: hidden;
      }

      .api-test-content {
        text-align: center;
        position: relative;
        z-index: 2;
      }

      .api-test-card h3 {
        color: var(--text-color);
        margin-bottom: var(--space-sm);
        font-size: 1.5rem;
        font-weight: 700;
      }

      .api-test-card p {
        color: var(--text-secondary);
        margin-bottom: var(--space-lg);
        font-size: 1rem;
      }

      .api-mode-indicator {
        margin-bottom: var(--space-lg);
      }

      .mode-badge {
        display: inline-block;
        padding: var(--space-sm) var(--space-lg);
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all var(--transition-normal);
      }

      .mode-badge.real {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
      }

      .mode-badge.mock {
        background: linear-gradient(135deg, #ffc107 0%, #ffeb3b 100%);
        color: #8b5a00;
        box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4);
      }

      .test-api-btn {
        position: relative;
        overflow: hidden;
        font-weight: 700;
        font-size: 1.125rem;
        padding: var(--space-md) var(--space-2xl);
        border-radius: 2rem;
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
        color: white;
        border: none;
        box-shadow: 
          0 8px 25px rgba(255, 107, 107, 0.3),
          0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all var(--transition-normal);
      }

      .test-api-btn:hover:not(:disabled) {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 
          0 12px 35px rgba(255, 107, 107, 0.4),
          0 8px 20px rgba(0, 0, 0, 0.2);
      }

      .test-api-btn:disabled {
        opacity: 0.8;
        cursor: not-allowed;
        transform: none;
      }

      .test-status-card {
        margin-top: var(--space-lg);
        padding: var(--space-md);
        border-radius: var(--space-md);
        font-weight: 500;
        animation: fadeInUp 0.3s ease;
      }

      .test-status-card .success {
        background: var(--success-gradient);
        color: white;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      }

      .test-status-card .error {
        background: var(--error-gradient);
        color: white;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      }

      .test-status-card .info {
        background: var(--accent-gradient);
        color: white;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
      }

      /* Content Grid */
      .content-grid {
        display: grid;
        gap: var(--space-2xl);
        max-width: 1000px;
        margin: 0 auto;
      }

      /* Section Cards */
      .section-card {
        position: relative;
      }

      .story-display-card {
        margin-top: var(--space-lg);
        position: relative;
      }

      .action-card {
        background: var(--card-bg);
      }

      .action-header {
        margin-bottom: var(--space-lg);
      }

      .action-header h4 {
        color: var(--text-color);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: var(--space-xs);
      }

      .action-buttons {
        display: flex;
        align-items: center;
        gap: var(--space-lg);
        flex-wrap: wrap;
      }

      .action-btn {
        flex-shrink: 0;
      }

      .status-indicator {
        flex: 1;
      }

      .badge {
        display: inline-block;
        padding: var(--space-xs) var(--space-md);
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .badge-success {
        background: var(--success-gradient);
        color: white;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      }

      /* Loading Components */
      .loading-content {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .loading-section {
        text-align: center;
        padding: var(--space-2xl);
      }

      .loading-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
      }

      .loading-header h4 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

      /* Voice and Synthesis Cards */
      .voice-card {
        position: relative;
      }

      .synthesis-actions {
        margin-top: var(--space-lg);
        text-align: center;
      }

      .synthesis-btn {
        font-size: 1.125rem;
        font-weight: 700;
        padding: var(--space-md) var(--space-2xl);
        border-radius: 2rem;
      }

      .synthesis-card {
        text-align: center;
        color: white;
      }

      .synthesis-progress {
        margin: var(--space-lg) 0;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--space-md);
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.8));
        border-radius: 4px;
        animation: progressFlow 2s ease-in-out infinite;
      }

      @keyframes progressFlow {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 100%; }
      }

      /* Audio Section */
      .audio-card {
        text-align: center;
        background: var(--success-gradient);
        color: white;
        position: relative;
        overflow: hidden;
      }

      .audio-header {
        margin-bottom: var(--space-lg);
      }

      .audio-header h4 {
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: var(--space-xs);
      }

      .audio-header p {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1rem;
        margin: 0;
      }

      /* Export Section */
      .export-card {
        background: var(--card-bg);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .hero-title {
          font-size: 2.5rem;
        }

        .hero-subtitle {
          font-size: 1.125rem;
        }

        .action-buttons {
          flex-direction: column;
          align-items: stretch;
        }

        .status-indicator {
          text-align: center;
        }
      }

      @media (max-width: 480px) {
        .modern-layout {
          padding: var(--space-lg) 0;
        }

        .hero-section {
          padding: var(--space-lg) 0;
          margin-bottom: var(--space-lg);
        }

        .hero-title {
          font-size: 2rem;
        }

        .content-grid {
          gap: var(--space-lg);
        }
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
    @Inject(SPEAKER_PARSER) private parser: any,
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
    } catch (error: any) {
      this.toastService.error('❌ Speaker Parsing Failed', error.message || 'Failed to parse speakers')
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
