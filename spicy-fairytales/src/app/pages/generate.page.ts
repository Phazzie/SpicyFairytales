/**
 * Redesigned primary application page with modern, colorful, and intuitive interface.
 * 
 * Features a completely new card-based layout with vibrant colors, logical button placement,
 * comprehensive testing capabilities, and extensive logging for troubleshooting. Designed
 * to be clean, sleek, modern, and easy to navigate while providing clear feedback when
 * things don't work as intended.
 * 
 * INPUT: User interactions from story form, testing panel, voice assignments, playback controls
 * OUTPUT: Complete story generation workflow, testing results, debug information, visual feedback
 * DEPENDENCIES: All core services, LoggerService, TestingPanel, DebugConsole
 * INTEGRATIONS: Orchestrates pipeline with comprehensive logging and testing capabilities
 * WORKFLOW: Story creation → real-time testing → generation → parsing → synthesis → export
 * ARCHITECTURE: Modern card-based UI with progressive disclosure and extensive debugging
 */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Observable, Subscription } from 'rxjs'
import { StoryFormComponent } from '../features/story/story-form.component'
import { StoryDisplayComponent } from '../features/story/story-display.component'
import { CharacterVoicesComponent } from '../features/voices/character-voices.component'
import { AudioPlayerComponent } from '../features/voice/audio-player.component'
import { ExportPanelComponent } from '../features/export/export-panel.component'
import { TestingPanelComponent } from '../shared/testing-panel.component'
import { SPEAKER_PARSER, STORY_SERVICE, VOICE_SERVICE } from '../shared/tokens'
import type { StoryOptions, StoryService, VoiceAssignment, VoiceService, AudioChunk } from '../shared/contracts'
import { StoryStore } from '../stores/story.store'
import { VoiceStore } from '../stores/voice.store'
import { env } from '../shared/env'
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component'
import { ToastService } from '../shared/toast.service'
import { LoggerService } from '../shared/logger.service'

@Component({
  selector: 'app-generate-page',
  standalone: true,
  imports: [CommonModule, FormsModule, StoryFormComponent, StoryDisplayComponent, CharacterVoicesComponent, AudioPlayerComponent, ExportPanelComponent, LoadingSkeletonComponent, TestingPanelComponent],
  template: `
    <div class="app-layout">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-icon">✨</span>
            Spicy FairyTales
            <span class="title-subtitle">AI Story Generator</span>
          </h1>
          <p class="hero-description">
            Create enchanting stories with characters that come alive through AI-powered narration
          </p>
          
          <!-- Quick Status Indicators -->
          <div class="status-indicators">
            <div class="status-card" [class]="getCurrentModeClass()">
              <span class="status-icon">{{ getCurrentModeIcon() }}</span>
              <div class="status-info">
                <span class="status-label">Mode</span>
                <span class="status-value">{{ getCurrentModeText() }}</span>
              </div>
            </div>
            
            <div class="status-card" [class]="getApiStatusClass()">
              <span class="status-icon">🔑</span>
              <div class="status-info">
                <span class="status-label">API Keys</span>
                <span class="status-value">{{ getApiStatusText() }}</span>
              </div>
            </div>
            
            <div class="status-card" [class]="getWorkflowStatusClass()">
              <span class="status-icon">⚡</span>
              <div class="status-info">
                <span class="status-label">Workflow</span>
                <span class="status-value">{{ getWorkflowStatusText() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        
        <!-- Story Creation Card -->
        <div class="main-card story-creation-card">
          <div class="card-header">
            <h2 class="card-title">
              <span class="card-icon">🎭</span>
              Create Your Story
            </h2>
            <div class="card-actions">
              <button 
                class="btn btn-secondary btn-sm"
                (click)="resetWorkflow()"
                *ngIf="store.currentText()"
                title="Start over"
              >
                🔄 Reset
              </button>
            </div>
          </div>
          
          <div class="card-content">
            <app-story-form 
              (onGenerate)="onGenerate($event)"
              (onTestApi)="onTestApi()"
              (onGenerateTestStory)="onGenerateTestStory($event)"
            ></app-story-form>
          </div>
        </div>

        <!-- Story Display & Progress Card -->
        <div class="main-card story-display-card" *ngIf="isGenerating || store.currentText()">
          <div class="card-header">
            <h2 class="card-title">
              <span class="card-icon">📖</span>
              Your Story
            </h2>
            <div class="workflow-progress">
              <div class="progress-step" [class.active]="isGenerating" [class.completed]="store.currentText() && !isGenerating">
                <span class="step-icon">✍️</span>
                <span class="step-label">Generate</span>
              </div>
              <div class="progress-arrow">→</div>
              <div class="progress-step" [class.active]="isParsing" [class.completed]="store.parsed()">
                <span class="step-icon">🗣️</span>
                <span class="step-label">Parse</span>
              </div>
              <div class="progress-arrow">→</div>
              <div class="progress-step" [class.active]="isSynthesizing" [class.completed]="audioUrl">
                <span class="step-icon">🎵</span>
                <span class="step-label">Synthesize</span>
              </div>
            </div>
          </div>
          
          <div class="card-content">
            <div *ngIf="isGenerating" class="generation-progress">
              <div class="progress-animation">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
                <p class="progress-text">✨ Crafting your enchanted tale...</p>
              </div>
              <app-loading-skeleton type="text" [lines]="6"></app-loading-skeleton>
            </div>
            
            <div *ngIf="store.currentText() && !isGenerating" class="story-content">
              <app-story-display [append]="latestChunk"></app-story-display>
              
              <!-- Parse Action -->
              <div class="action-section" *ngIf="!isParsing && !store.parsed()">
                <button
                  (click)="parseCurrent()"
                  class="btn btn-primary btn-large"
                  [disabled]="isParsing"
                >
                  <span class="btn-icon">🗣️</span>
                  Analyze Characters & Dialogue
                  <span class="btn-subtitle">Prepare for voice synthesis</span>
                </button>
              </div>
              
              <!-- Parsing Progress -->
              <div *ngIf="isParsing" class="parsing-progress">
                <div class="progress-animation">
                  <div class="analysis-indicator">
                    <span class="analysis-icon">🔍</span>
                    <span class="analysis-text">Analyzing dialogue and characters...</span>
                  </div>
                </div>
                <app-loading-skeleton type="card" [lines]="3"></app-loading-skeleton>
              </div>
            </div>
          </div>
        </div>

        <!-- Character Voices Card -->
        <div class="main-card voices-card" *ngIf="store.parsed()">
          <div class="card-header">
            <h2 class="card-title">
              <span class="card-icon">🎤</span>
              Voice Assignment
            </h2>
            <div class="card-stats">
              <span class="stat-pill">
                {{ store.parsed()?.characters?.length || 0 }} Characters
              </span>
              <span class="stat-pill">
                {{ store.parsed()?.segments?.length || 0 }} Segments
              </span>
            </div>
          </div>
          
          <div class="card-content">
            <app-character-voices />
            
            <!-- Synthesize Action -->
            <div class="action-section" *ngIf="!isSynthesizing && !audioUrl">
              <button
                (click)="synthesize()"
                class="btn btn-success btn-large"
                [disabled]="isSynthesizing"
              >
                <span class="btn-icon">🔊</span>
                Generate Audio Story
                <span class="btn-subtitle">Create immersive narration</span>
              </button>
            </div>
            
            <!-- Synthesis Progress -->
            <div *ngIf="isSynthesizing" class="synthesis-progress">
              <div class="progress-animation">
                <div class="synthesis-indicator">
                  <span class="synthesis-icon">🎵</span>
                  <span class="synthesis-text">Creating magical voices...</span>
                </div>
              </div>
              <app-loading-skeleton type="card" [lines]="2"></app-loading-skeleton>
            </div>
          </div>
        </div>

        <!-- Audio Player & Export Card -->
        <div class="main-card audio-card" *ngIf="audioUrl">
          <div class="card-header">
            <h2 class="card-title">
              <span class="card-icon">🎧</span>
              Your Audio Story
            </h2>
            <div class="card-badge success">
              <span class="badge-icon">✅</span>
              Complete
            </div>
          </div>
          
          <div class="card-content">
            <app-audio-player [src]="audioUrl" />
            <app-export-panel />
          </div>
        </div>
      </div>

      <!-- Testing & Debugging Panel -->
      <app-testing-panel
        [testApiCallback]="testApiCallback"
        [generateTestStoryCallback]="generateTestStoryCallback"
        (modeChange)="onModeChange($event)"
      ></app-testing-panel>
    </div>
  `,
  styles: [
    `
      .app-layout {
        min-height: 100vh;
        background: var(--bg-gradient);
        position: relative;
        overflow-x: hidden;
      }

      /* Hero Header */
      .hero-header {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%);
        color: white;
        padding: var(--space-2xl) var(--space-lg);
        margin-bottom: var(--space-xl);
        position: relative;
        overflow: hidden;
      }

      .hero-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }

      .hero-content {
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
        position: relative;
        z-index: 1;
      }

      .hero-title {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: var(--space-md);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        flex-wrap: wrap;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .title-icon {
        font-size: 3.5rem;
        animation: float 3s ease-in-out infinite;
      }

      .title-subtitle {
        font-size: 1.25rem;
        font-weight: 400;
        opacity: 0.9;
        font-style: italic;
      }

      .hero-description {
        font-size: 1.2rem;
        margin-bottom: var(--space-xl);
        opacity: 0.95;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      /* Status Indicators */
      .status-indicators {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-lg);
        max-width: 800px;
        margin: 0 auto;
      }

      .status-card {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--space-lg);
        padding: var(--space-lg);
        display: flex;
        align-items: center;
        gap: var(--space-md);
        transition: all var(--transition-normal);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .status-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .status-card.success {
        border-color: rgba(34, 197, 94, 0.4);
        background: rgba(34, 197, 94, 0.1);
      }

      .status-card.warning {
        border-color: rgba(245, 158, 11, 0.4);
        background: rgba(245, 158, 11, 0.1);
      }

      .status-card.error {
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.1);
      }

      .status-icon {
        font-size: 1.5rem;
      }

      .status-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .status-label {
        font-size: 0.875rem;
        opacity: 0.8;
        font-weight: 500;
      }

      .status-value {
        font-size: 1rem;
        font-weight: 600;
      }

      /* Content Grid */
      .content-grid {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--space-lg);
        display: grid;
        gap: var(--space-xl);
      }

      /* Main Cards */
      .main-card {
        background: var(--card-bg);
        backdrop-filter: var(--glass-backdrop);
        border: 1px solid var(--glass-border);
        border-radius: var(--glass-border-radius);
        overflow: hidden;
        box-shadow: var(--glass-shadow);
        transition: all var(--transition-normal);
        position: relative;
      }

      .main-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
      }

      .main-card:hover {
        transform: translateY(-4px);
        box-shadow: 
          var(--shadow-xl),
          0 0 30px rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.3);
      }

      /* Card Headers */
      .card-header {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
        padding: var(--space-lg) var(--space-xl);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--space-md);
      }

      .card-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-color);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .card-icon {
        font-size: 1.75rem;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }

      .card-actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .card-stats {
        display: flex;
        gap: var(--space-sm);
      }

      .stat-pill {
        background: rgba(99, 102, 241, 0.1);
        color: var(--primary-600);
        padding: 0.375rem 0.75rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      .card-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .card-badge.success {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.2);
      }

      .badge-icon {
        font-size: 1rem;
      }

      .card-content {
        padding: var(--space-xl);
      }

      /* Workflow Progress */
      .workflow-progress {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        background: rgba(255, 255, 255, 0.5);
        padding: var(--space-md);
        border-radius: var(--space-md);
        border: 1px solid var(--border-color);
      }

      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: var(--space-sm);
        border-radius: var(--space-sm);
        transition: all var(--transition-normal);
        min-width: 60px;
      }

      .progress-step.active {
        background: rgba(99, 102, 241, 0.1);
        color: var(--primary-600);
        animation: pulse 2s infinite;
      }

      .progress-step.completed {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      .step-icon {
        font-size: 1.25rem;
        transition: all var(--transition-normal);
      }

      .step-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .progress-arrow {
        color: var(--text-muted);
        font-weight: bold;
        font-size: 1.25rem;
      }

      /* Progress Animations */
      .generation-progress,
      .parsing-progress,
      .synthesis-progress {
        text-align: center;
        padding: var(--space-xl);
      }

      .progress-animation {
        margin-bottom: var(--space-lg);
      }

      .typing-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        margin-bottom: var(--space-md);
      }

      .typing-indicator span {
        height: 0.5rem;
        width: 0.5rem;
        background: var(--primary-500);
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
      }

      .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
      .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
      .typing-indicator span:nth-child(3) { animation-delay: 0s; }

      @keyframes typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1.2); opacity: 1; }
      }

      .analysis-indicator,
      .synthesis-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
      }

      .analysis-icon,
      .synthesis-icon {
        font-size: 2rem;
        animation: float 2s ease-in-out infinite;
      }

      .progress-text,
      .analysis-text,
      .synthesis-text {
        font-size: 1.1rem;
        color: var(--text-secondary);
        font-weight: 500;
      }

      /* Action Sections */
      .action-section {
        margin-top: var(--space-xl);
        text-align: center;
      }

      /* Enhanced Button Styles */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        padding: var(--space-md) var(--space-xl);
        border: none;
        border-radius: var(--space-md);
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all var(--transition-normal);
        text-decoration: none;
        position: relative;
        overflow: hidden;
        backdrop-filter: var(--glass-backdrop);
        box-shadow: var(--shadow-lg);
        text-align: center;
      }

      .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left var(--transition-slow);
      }

      .btn:hover::before {
        left: 100%;
      }

      .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }

      .btn-large {
        padding: var(--space-lg) var(--space-2xl);
        font-size: 1.1rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .btn-primary {
        background: var(--accent-gradient);
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 
          var(--shadow-xl),
          0 0 20px rgba(99, 102, 241, 0.4);
      }

      .btn-secondary {
        background: var(--card-bg);
        color: var(--text-color);
        border: 2px solid var(--border-color);
      }

      .btn-secondary:hover:not(:disabled) {
        background: var(--hover-bg);
        border-color: var(--primary-500);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .btn-success {
        background: var(--success-gradient);
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .btn-success:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 
          var(--shadow-xl),
          0 0 20px rgba(34, 197, 94, 0.4);
      }

      .btn:active {
        transform: translateY(0) scale(0.98);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
      }

      .btn-icon {
        font-size: 1.25rem;
      }

      .btn-subtitle {
        font-size: 0.875rem;
        opacity: 0.9;
        font-weight: 400;
      }

      /* Story Content */
      .story-content {
        position: relative;
      }

      /* Card Specific Styles */
      .story-creation-card {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
      }

      .story-display-card {
        background: linear-gradient(135deg, rgba(254, 249, 195, 0.95) 0%, rgba(255, 237, 213, 0.95) 100%);
      }

      .voices-card {
        background: linear-gradient(135deg, rgba(236, 254, 255, 0.95) 0%, rgba(224, 242, 254, 0.95) 100%);
      }

      .audio-card {
        background: linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(220, 252, 231, 0.95) 100%);
      }

      /* Responsive Design */
      @media (max-width: 1024px) {
        .hero-title {
          font-size: 2.5rem;
        }

        .status-indicators {
          grid-template-columns: 1fr;
        }

        .card-header {
          flex-direction: column;
          align-items: stretch;
          text-align: center;
        }

        .workflow-progress {
          flex-direction: column;
          gap: var(--space-md);
        }

        .progress-arrow {
          transform: rotate(90deg);
        }
      }

      @media (max-width: 768px) {
        .hero-header {
          padding: var(--space-xl) var(--space-md);
        }

        .hero-title {
          font-size: 2rem;
          flex-direction: column;
        }

        .title-icon {
          font-size: 2.5rem;
        }

        .content-grid {
          padding: 0 var(--space-md);
        }

        .card-content {
          padding: var(--space-lg);
        }

        .btn-large {
          padding: var(--space-md) var(--space-lg);
          font-size: 1rem;
        }
      }

      @media (max-width: 480px) {
        .hero-title {
          font-size: 1.75rem;
        }

        .hero-description {
          font-size: 1rem;
        }

        .card-content {
          padding: var(--space-md);
        }

        .workflow-progress {
          gap: var(--space-sm);
        }

        .progress-step {
          min-width: 50px;
        }

        .step-label {
          font-size: 0.625rem;
        }
      }
    `,
  ],
})
export class GeneratePageComponent implements OnInit, OnDestroy {
  latestChunk: string | null = null
  private sub?: Subscription
  audioUrl: string | null = null
  isTesting = false
  testStatus: { type: string; message: string } | null = null
  isMockMode = env.useMocks

  // Loading states
  isGenerating = false
  isParsing = false
  isSynthesizing = false

  // Callback functions for testing panel
  testApiCallback = () => this.onTestApi()
  generateTestStoryCallback = (wordCount: number) => this.onGenerateTestStory(wordCount)

  private logger: any

  constructor(
    @Inject(STORY_SERVICE) private story: StoryService,
    public store: StoryStore,
    @Inject(SPEAKER_PARSER) private parser: any,
    @Inject(VOICE_SERVICE) private voice: VoiceService,
    public voiceStore: VoiceStore,
    private toast: ToastService,
    private loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.createLogger('GeneratePage');
  }

  ngOnInit(): void {
    this.logger.info('Generate page initialized');
    this.loggerService.info('Application started', 'Application', {
      mode: this.isMockMode ? 'mock' : 'real',
      timestamp: new Date().toISOString()
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.logger.info('Generate page destroyed');
  }

  // Status Methods for Hero Header
  getCurrentModeClass(): string {
    return this.isMockMode ? 'warning' : 'success';
  }

  getCurrentModeIcon(): string {
    return this.isMockMode ? '🎭' : '🔥';
  }

  getCurrentModeText(): string {
    return this.isMockMode ? 'Mock Mode' : 'Real APIs';
  }

  getApiStatusClass(): string {
    const hasGrokKey = this.hasGrokKey();
    const hasElevenKey = this.hasElevenKey();
    
    if (hasGrokKey && hasElevenKey) return 'success';
    if (hasGrokKey || hasElevenKey) return 'warning';
    return 'error';
  }

  getApiStatusText(): string {
    const hasGrokKey = this.hasGrokKey();
    const hasElevenKey = this.hasElevenKey();
    
    if (hasGrokKey && hasElevenKey) return 'Ready';
    if (hasGrokKey || hasElevenKey) return 'Partial';
    return 'Missing';
  }

  getWorkflowStatusClass(): string {
    if (this.audioUrl) return 'success';
    if (this.store.parsed()) return 'warning';
    if (this.store.currentText()) return 'warning';
    return 'error';
  }

  getWorkflowStatusText(): string {
    if (this.audioUrl) return 'Complete';
    if (this.isSynthesizing) return 'Synthesizing';
    if (this.store.parsed()) return 'Ready to Synthesize';
    if (this.isParsing) return 'Parsing';
    if (this.store.currentText()) return 'Ready to Parse';
    if (this.isGenerating) return 'Generating';
    return 'Ready to Start';
  }

  private hasGrokKey(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return !!localStorage.getItem('XAI_API_KEY') || !!(window as any).VITE_XAI_API_KEY;
    } catch {
      return false;
    }
  }

  private hasElevenKey(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return !!localStorage.getItem('ELEVENLABS_API_KEY') || !!(window as any).VITE_ELEVENLABS_API_KEY;
    } catch {
      return false;
    }
  }

  // Workflow Methods
  resetWorkflow(): void {
    this.logger.user('Workflow reset initiated');
    
    // Clean up any existing audio
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
    
    // Reset all states
    this.store.reset();
    this.latestChunk = '';
    this.isGenerating = false;
    this.isParsing = false;
    this.isSynthesizing = false;
    
    // Cancel any ongoing subscriptions
    this.sub?.unsubscribe();
    
    this.toast.info('Workflow Reset', 'Ready to create a new story');
    this.logger.success('Workflow reset completed');
  }

  onModeChange(mode: 'mock' | 'real'): void {
    this.isMockMode = mode === 'mock';
    this.logger.user(`Mode changed to ${mode}`, { previousMode: this.isMockMode ? 'real' : 'mock' });
  }

  onGenerate(options: StoryOptions): void {
    this.logger.info('Story generation started', { options });
    
    this.isGenerating = true
    this.latestChunk = ''
    this.store.reset()

    // Clean up any existing audio
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }

    this.sub = this.story.generateStory(options).subscribe({
      next: (chunk: string) => {
        this.latestChunk += chunk
        this.store.append(chunk)
        this.logger.debug('Story chunk received', { chunkLength: chunk.length });
      },
      error: (err: Error) => {
        this.isGenerating = false
        this.logger.error('Story generation failed', { error: err.message });
        this.toast.error('Story Generation Failed', err.message)
      },
      complete: () => {
        this.isGenerating = false
        this.logger.success('Story generation completed', { totalLength: this.latestChunk?.length });
        this.toast.success('Story Complete', 'Your enchanted tale is ready!')
      },
    })
  }

  onTestApi(): void {
    this.logger.user('API test initiated');
    this.toast.info('API Test', 'Testing API connectivity...')
    
    // Simulate API test with comprehensive logging
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        this.logger.success('API test completed successfully');
        this.toast.success('API Test', 'All systems operational!')
      } else {
        this.logger.error('API test failed', { reason: 'Connection timeout' });
        this.toast.error('API Test', 'Connection issues detected')
      }
    }, 2000)
  }

  onGenerateTestStory(wordCount: number): void {
    this.logger.user('Test story generation requested', { wordCount });
    
    const options: StoryOptions = {
      length: wordCount < 600 ? 'short' : 'medium',
      characterType: 'werewolf',
      spicyLevel: 5,
      themes: ['romance', 'intrigue'],
      genre: 'fantasy',
      tone: 'dark',
      prompt: `Generate a ${wordCount}-word test story for API validation`
    }
    
    this.toast.info('Test Story', `Generating ${wordCount}-word test story...`)
    this.onGenerate(options)
  }

  parseCurrent(): void {
    const text = this.store.currentText()
    if (!text) {
      this.logger.error('Parse attempted with no story text');
      this.toast.error('Parse Error', 'No story text available to parse. Please generate a story first.')
      return
    }

    this.logger.info('Speaker parsing started', { textLength: text.length });
    this.isParsing = true
    this.toast.info('Parsing', 'Analyzing dialogue and characters...')

    this.parser.parseStory(text).then((parsed: any) => {
      if (!parsed.segments || parsed.segments.length === 0) {
        throw new Error('No segments found in the story')
      }

      this.store.setParsed(parsed)
      this.logger.success('Speaker parsing completed', {
        segments: parsed.segments.length,
        characters: parsed.characters.length
      });
      this.toast.success('Parsing Complete', `Found ${parsed.segments.length} segments and ${parsed.characters.length} characters`)
    }).catch((error: any) => {
      this.logger.error('Speaker parsing failed', { error: error.message });
      this.toast.error('Parse Failed', error.message)
      console.error('Parse error:', error)
    }).finally(() => {
      this.isParsing = false
    })
  }

  async testRealAPIs() {
    this.logger.info('Real API testing started');
    this.isTesting = true
    this.testStatus = null

    try {
      // Step 1: Generate a story
      this.testStatus = { type: 'info', message: '📝 Generating story with Grok...' }
      this.logger.api('Testing story generation');
      await this.testStoryGeneration()

      // Step 2: Parse speakers
      this.testStatus = { type: 'info', message: '🗣️ Parsing speakers with Grok...' }
      this.logger.api('Testing speaker parsing');
      await this.testSpeakerParsing()

      // Step 3: Synthesize audio
      this.testStatus = { type: 'info', message: '🔊 Synthesizing audio with ElevenLabs...' }
      this.logger.api('Testing audio synthesis');
      await this.testAudioSynthesis()

      this.testStatus = { type: 'success', message: '✅ All APIs working perfectly! Full pipeline test successful.' }
      this.logger.success('Real API testing completed successfully');
      this.toast.success('API Test', 'Full pipeline test successful!')

    } catch (error: any) {
      this.testStatus = { type: 'error', message: `❌ API Test Failed: ${error.message}` }
      this.logger.error('Real API testing failed', { error: error.message });
      this.toast.error('API Test', `Test failed: ${error.message}`)
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

      this.logger.api('Starting test story generation', { options: testOptions });

      this.sub = this.story.generateStory(testOptions).subscribe({
        next: (chunk: string) => {
          this.latestChunk = chunk
          this.store.append(chunk)
          this.logger.debug('Test story chunk received', { chunkLength: chunk.length });
        },
        error: (error: any) => {
          this.logger.error('Test story generation failed', { error: error.message });
          reject(new Error(`Story generation failed: ${error.message}`))
        },
        complete: () => {
          this.logger.success('Test story generation completed');
          resolve()
        }
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        this.logger.error('Test story generation timed out');
        reject(new Error('Story generation timed out'))
      }, 30000)
    })
  }

  private async testSpeakerParsing(): Promise<void> {
    const text = this.store.currentText()
    if (!text) {
      this.logger.error('No story text available for parsing test');
      throw new Error('No story text to parse')
    }

    this.logger.api('Starting test speaker parsing', { textLength: text.length });

    const parsed = await this.parser.parseStory(text)
    if (!parsed.segments || parsed.segments.length === 0) {
      this.logger.error('Speaker parsing returned no segments');
      throw new Error('Speaker parsing returned no segments')
    }

    this.store.setParsed(parsed)
    this.logger.success('Test speaker parsing completed', {
      segments: parsed.segments.length,
      characters: parsed.characters.length
    });
  }

  private async testAudioSynthesis(): Promise<void> {
    const parsed = this.store.parsed()
    if (!parsed) {
      this.logger.error('No parsed story available for synthesis test');
      throw new Error('No parsed story for audio synthesis')
    }

    this.logger.api('Starting test audio synthesis');

    return new Promise((resolve, reject) => {
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl)
        this.audioUrl = null
      }

      const assigns: VoiceAssignment[] = Object.entries(this.voiceStore.assignments()).map(([character, voiceId]) => ({ character, voiceId: voiceId as string }))
      const narratorVoice = this.voiceStore.narratorVoice() || undefined
      const buffers: ArrayBuffer[] = []

      const sub = this.voice.synthesize(parsed, assigns, narratorVoice).subscribe({
        next: (chunk: AudioChunk) => {
          buffers.push(chunk.audio)
          this.logger.debug('Audio chunk received', { bufferLength: chunk.audio.byteLength });
        },
        error: (error: any) => {
          this.logger.error('Test audio synthesis failed', { error: error.message });
          reject(new Error(`Audio synthesis failed: ${error.message}`))
        },
        complete: () => {
          if (buffers.length === 0) {
            this.logger.error('No audio data received from synthesis');
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
          
          this.logger.success('Test audio synthesis completed', {
            bufferCount: buffers.length,
            totalSize: total
          });
          resolve()
        }
      })

      // Timeout after 60 seconds
      setTimeout(() => {
        this.logger.error('Test audio synthesis timed out');
        reject(new Error('Audio synthesis timed out'))
      }, 60000)
    })
  }

  synthesize(): void {
    const parsed = this.store.parsed()
    if (!parsed) {
      this.logger.error('Synthesis attempted with no parsed story');
      this.toast.error('Synthesis Error', 'No parsed story available. Please parse speakers first.')
      return
    }

    this.logger.info('Audio synthesis started', {
      segments: parsed.segments.length,
      characters: parsed.characters.length
    });

    this.isSynthesizing = true
    this.toast.info('Audio Synthesis', 'Creating magical voices...')

    const assigns: VoiceAssignment[] = Object.entries(this.voiceStore.assignments()).map(([character, voiceId]) => ({ character, voiceId: voiceId as string }))
    const narratorVoice = this.voiceStore.narratorVoice() || undefined
    const buffers: ArrayBuffer[] = []

    this.logger.debug('Voice assignments', { assigns, narratorVoice });

    const sub = this.voice.synthesize(parsed, assigns, narratorVoice).subscribe({
      next: (chunk: AudioChunk) => {
        buffers.push(chunk.audio)
        this.logger.debug('Audio chunk received during synthesis', {
          bufferLength: chunk.audio.byteLength,
          character: chunk.character,
          segmentType: chunk.segmentType
        });
      },
      error: (error: any) => {
        this.isSynthesizing = false
        this.logger.error('Audio synthesis failed', { error: error.message });
        this.toast.error('Synthesis Failed', error.message)
      },
      complete: () => {
        this.isSynthesizing = false
        if (buffers.length === 0) {
          this.logger.error('Audio synthesis completed but no data received');
          this.toast.error('Synthesis Error', 'No audio data received')
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
        
        this.logger.success('Audio synthesis completed successfully', {
          bufferCount: buffers.length,
          totalSize: total,
          audioUrl: !!this.audioUrl
        });
        this.toast.success('Synthesis Complete', 'Your audio story is ready!')
      }
    })
  }
}
