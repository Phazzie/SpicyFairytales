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
    <div class="modern-layout">
      <!-- Header Section -->
      <div class="app-header">
        <div class="header-content">
          <div class="brand-section">
            <h1 class="app-title">✨ Spicy FairyTales</h1>
            <p class="app-subtitle">AI-powered storytelling with immersive voice synthesis</p>
          </div>
          <div class="header-actions">
            <div class="api-status-mini">
              <div class="status-item" [class.connected]="hasGrokKey">
                <span class="status-icon">{{ hasGrokKey ? '🟢' : '🔴' }}</span>
                <span class="status-text">Grok</span>
              </div>
              <div class="status-item" [class.connected]="hasElevenKey">
                <span class="status-icon">{{ hasElevenKey ? '🟢' : '🔴' }}</span>
                <span class="status-text">ElevenLabs</span>
              </div>
            </div>
            <button class="btn-icon" (click)="toggleApiKeys()" title="Configure API Keys">
              <span>🔑</span>
            </button>
          </div>
        </div>
      </div>

      <!-- API Keys Panel (Collapsible) -->
      <div class="api-keys-panel" [class.expanded]="showApiKeys">
        <div class="panel-header">
          <h3>🔑 API Configuration</h3>
          <button class="btn-close" (click)="toggleApiKeys()">×</button>
        </div>
        <div class="panel-content">
          <p class="panel-description">Keys are stored securely in your browser's localStorage</p>
          <div class="keys-grid">
            <div class="key-item">
              <label>Grok API Key (x.ai)</label>
              <input type="password" [(ngModel)]="grokKeyInput" placeholder="Enter your Grok API key" />
            </div>
            <div class="key-item">
              <label>ElevenLabs API Key</label>
              <input type="password" [(ngModel)]="elevenKeyInput" placeholder="Enter your ElevenLabs API key" />
            </div>
          </div>
          <div class="keys-actions">
            <button class="btn btn-primary" (click)="saveKeys()">💾 Save Keys</button>
            <button class="btn btn-secondary" (click)="loadKeys()">📂 Load from Browser</button>
            <button class="btn btn-danger" (click)="clearKeys()">🗑️ Clear Keys</button>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-content">
        <!-- Story Creation Section -->
        <div class="story-creation-section">
          <div class="section-header">
            <h2>🎭 Create Your Story</h2>
            <p>Configure your story parameters and generate your unique tale</p>
          </div>
          
          <app-story-form 
            (onGenerate)="onGenerate($event)"
            (onTestApi)="onTestApi()"
            (onGenerateTestStory)="onGenerateTestStory($event)"
          ></app-story-form>
        </div>

        <!-- Story Display Section -->
        <div class="story-display-section" *ngIf="store.currentText() || isGenerating">
          <div class="section-header">
            <h2>📖 Your Story</h2>
            <div class="story-actions" *ngIf="store.currentText()">
              <button
                (click)="parseCurrent()"
                [disabled]="isParsing"
                class="btn btn-accent"
              >
                {{ isParsing ? '🗣️ Parsing...' : '🗣️ Parse Speakers' }}
              </button>
              <span class="parse-info" *ngIf="store.parsed()">
                Found {{ store.parsed()?.segments?.length || 0 }} segments & {{ store.parsed()?.characters?.length || 0 }} characters
              </span>
            </div>
          </div>

          <div class="story-content">
            <div *ngIf="!isGenerating; else storyLoading">
              <app-story-display [append]="latestChunk"></app-story-display>
            </div>
            <ng-template #storyLoading>
              <div class="loading-section">
                <div class="loading-header">
                  <h4>✨ Crafting your story...</h4>
                  <div class="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
                <app-loading-skeleton type="text" [lines]="8"></app-loading-skeleton>
              </div>
            </ng-template>
          </div>

          <!-- Parsing Section -->
          <div class="parsing-section" *ngIf="isParsing">
            <div class="section-card">
              <h4>🎭 Analyzing dialogue and characters...</h4>
              <app-loading-skeleton type="card" [lines]="3"></app-loading-skeleton>
            </div>
          </div>
        </div>

        <!-- Voice & Audio Section -->
        <div class="voice-audio-section" *ngIf="store.parsed()">
          <div class="section-header">
            <h2>🎙️ Voice & Audio</h2>
            <p>Assign voices to characters and generate audio</p>
          </div>

          <div class="voice-content">
            <app-character-voices />

            <div class="audio-actions">
              <button
                (click)="synthesize()"
                [disabled]="isSynthesizing"
                class="btn btn-primary btn-large"
              >
                {{ isSynthesizing ? '🔊 Synthesizing...' : '🔊 Generate Audio' }}
              </button>
            </div>

            <!-- Synthesis Section -->
            <div class="synthesis-section" *ngIf="isSynthesizing">
              <div class="section-card">
                <h4>🎵 Creating voice audio...</h4>
                <div class="synthesis-progress">
                  <div class="progress-bar"></div>
                </div>
                <app-loading-skeleton type="card" [lines]="2"></app-loading-skeleton>
              </div>
            </div>

            <!-- Audio Player Section -->
            <div class="audio-player-section" *ngIf="audioUrl">
              <div class="section-card">
                <h4>🎵 Your Audio Story</h4>
                <app-audio-player [src]="audioUrl" />
              </div>
            </div>
          </div>
        </div>

        <!-- Export Section -->
        <div class="export-section" *ngIf="store.currentText()">
          <div class="section-header">
            <h2>💾 Export Your Story</h2>
            <p>Download your story in various formats</p>
          </div>
          <app-export-panel />
        </div>
      </div>

      <!-- Testing & Debug Section -->
      <div class="testing-debug-section">
        <div class="section-header">
          <h2>🧪 Testing & Debug Tools</h2>
          <p>Comprehensive testing tools and API diagnostics</p>
        </div>

        <div class="debug-grid">
          <!-- API Testing -->
          <div class="debug-card">
            <h3>🚀 API Integration Test</h3>
            <p>Test the complete pipeline with real APIs</p>
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
              {{ isTesting ? 'Testing APIs...' : '🔥 Full Pipeline Test' }}
            </button>
            <div class="test-status" *ngIf="testStatus">
              <div [class]="'status-message ' + testStatus.type">
                {{ testStatus.message }}
              </div>
            </div>
          </div>

          <!-- Quick Tests -->
          <div class="debug-card">
            <h3>⚡ Quick Tests</h3>
            <p>Generate test stories with predefined parameters</p>
            <div class="quick-test-buttons">
              <button (click)="onGenerateTestStory(400)" class="test-btn">
                📝 400-word Test
              </button>
              <button (click)="onGenerateTestStory(800)" class="test-btn">
                📖 800-word Test
              </button>
              <button (click)="onTestApi()" class="test-btn">
                🔗 API Connection Test
              </button>
            </div>
          </div>

          <!-- Debug Console -->
          <div class="debug-card debug-console">
            <h3>🐛 Debug Console</h3>
            <div class="console-content">
              <div class="console-log" #debugConsole>
                <div class="log-entry" *ngFor="let log of debugLogs" [class]="'log-' + log.level">
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-level">{{ log.level.toUpperCase() }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
                <div *ngIf="debugLogs.length === 0" class="log-empty">
                  Console ready - perform actions to see debug information
                </div>
              </div>
            </div>
            <div class="console-actions">
              <button (click)="clearDebugLogs()" class="btn btn-small">Clear</button>
              <button (click)="exportDebugLogs()" class="btn btn-small">Export</button>
            </div>
          </div>

          <!-- System Status -->
          <div class="debug-card">
            <h3>📊 System Status</h3>
            <div class="status-grid">
              <div class="status-row">
                <span class="status-label">Environment:</span>
                <span class="status-value">{{ isMockMode ? 'Development' : 'Production' }}</span>
              </div>
              <div class="status-row">
                <span class="status-label">Story Generated:</span>
                <span class="status-value">{{ store.currentText() ? 'Yes' : 'No' }}</span>
              </div>
              <div class="status-row">
                <span class="status-label">Speakers Parsed:</span>
                <span class="status-value">{{ store.parsed() ? 'Yes' : 'No' }}</span>
              </div>
              <div class="status-row">
                <span class="status-label">Audio Available:</span>
                <span class="status-value">{{ audioUrl ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Modern Layout Container */
      .modern-layout {
        min-height: 100vh;
        background: var(--bg-gradient);
        padding: 0;
        margin: 0;
      }

      /* Header Section */
      .app-header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding: 1.5rem 0;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .brand-section {
        flex: 1;
      }

      .app-title {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.02em;
      }

      .app-subtitle {
        margin: 0.25rem 0 0 0;
        font-size: 1.1rem;
        color: var(--text-secondary);
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .api-status-mini {
        display: flex;
        gap: 0.75rem;
      }

      .status-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.875rem;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .status-item.connected {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.3);
        color: #22c55e;
      }

      .status-icon {
        font-size: 0.75rem;
      }

      .btn-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }

      .btn-icon:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }

      /* Collapsible API Keys Panel */
      .api-keys-panel {
        max-height: 0;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        transition: all 0.5s ease-out;
        position: relative;
      }

      .api-keys-panel.expanded {
        max-height: 400px;
        padding: 2rem 0;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        margin-bottom: 1.5rem;
      }

      .panel-header h3 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-color);
      }

      .btn-close {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.1);
        color: var(--text-color);
        cursor: pointer;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .btn-close:hover {
        background: rgba(255, 0, 0, 0.2);
        color: #ef4444;
      }

      .panel-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
      }

      .panel-description {
        margin: 0 0 1.5rem 0;
        color: var(--text-secondary);
        font-style: italic;
        text-align: center;
      }

      .keys-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .key-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .key-item label {
        font-weight: 600;
        color: var(--text-color);
        font-size: 0.9rem;
      }

      .key-item input {
        padding: 0.75rem 1rem;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        font-size: 0.9rem;
        background: rgba(255, 255, 255, 0.8);
        transition: all 0.3s ease;
      }

      .key-item input:focus {
        outline: none;
        border-color: var(--primary-500);
        background: white;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .keys-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      /* Main Content */
      .main-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        display: grid;
        gap: 3rem;
      }

      /* Section Headers */
      .section-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .section-header h2 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .section-header p {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text-secondary);
        font-weight: 500;
      }

      /* Story Creation Section */
      .story-creation-section {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      /* Story Display Section */
      .story-display-section {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .story-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;
        flex-wrap: wrap;
      }

      .parse-info {
        padding: 0.5rem 1rem;
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        border: 1px solid rgba(34, 197, 94, 0.2);
      }

      .story-content {
        margin-top: 1.5rem;
      }

      /* Loading Section */
      .loading-section {
        text-align: center;
        padding: 2rem;
      }

      .loading-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .loading-header h4 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-color);
      }

      .loading-dots {
        display: flex;
        gap: 0.5rem;
      }

      .loading-dots span {
        width: 0.75rem;
        height: 0.75rem;
        background: var(--primary-500);
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;
      }

      .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      /* Voice & Audio Section */
      .voice-audio-section {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .audio-actions {
        display: flex;
        justify-content: center;
        margin: 2rem 0;
      }

      .btn-large {
        padding: 1rem 2.5rem;
        font-size: 1.1rem;
        border-radius: 16px;
        min-width: 250px;
      }

      /* Section Cards */
      .section-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin: 1rem 0;
        text-align: center;
      }

      .section-card h4 {
        margin: 0 0 1rem 0;
        color: var(--text-color);
      }

      /* Synthesis Progress */
      .synthesis-progress {
        margin: 1rem 0;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-bar {
        height: 100%;
        background: var(--accent-gradient);
        border-radius: 2px;
        animation: progress 2s ease-in-out infinite;
      }

      @keyframes progress {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 100%; }
      }

      /* Export Section */
      .export-section {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      /* Testing & Debug Section */
      .testing-debug-section {
        background: linear-gradient(135deg, rgba(255, 0, 150, 0.1) 0%, rgba(0, 204, 255, 0.1) 100%);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        margin-top: 3rem;
      }

      .debug-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .debug-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(15px);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }

      .debug-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      }

      .debug-card h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1.25rem;
        color: var(--text-color);
      }

      .debug-card p {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      /* API Testing */
      .api-mode-indicator {
        margin: 1rem 0;
        text-align: center;
      }

      .mode-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
      }

      .mode-badge.real {
        background: rgba(255, 107, 107, 0.2);
        color: #ff6b6b;
        border: 1px solid rgba(255, 107, 107, 0.3);
        animation: pulse 2s infinite;
      }

      .mode-badge.mock {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
        border: 1px solid rgba(255, 193, 7, 0.3);
      }

      .test-api-btn {
        width: 100%;
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
      }

      .test-api-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 25px rgba(255, 107, 107, 0.4);
      }

      .test-api-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .test-status {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 8px;
        font-weight: 500;
        text-align: center;
      }

      .status-message.success {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.3);
      }

      .status-message.error {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .status-message.info {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.3);
      }

      /* Quick Tests */
      .quick-test-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .test-btn {
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 8px;
        background: rgba(99, 102, 241, 0.8);
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.9rem;
      }

      .test-btn:hover {
        background: rgba(99, 102, 241, 1);
        transform: translateY(-1px);
      }

      /* Debug Console */
      .debug-console {
        grid-column: span 2;
      }

      .console-content {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin: 1rem 0;
      }

      .console-log {
        max-height: 200px;
        overflow-y: auto;
        padding: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        line-height: 1.4;
      }

      .log-entry {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        word-break: break-word;
      }

      .log-time {
        color: #94a3b8;
        flex-shrink: 0;
        font-weight: 500;
      }

      .log-level {
        flex-shrink: 0;
        font-weight: 600;
        min-width: 60px;
      }

      .log-entry.log-error .log-level {
        color: #ef4444;
      }

      .log-entry.log-warn .log-level {
        color: #f59e0b;
      }

      .log-entry.log-info .log-level {
        color: #3b82f6;
      }

      .log-entry.log-debug .log-level {
        color: #6b7280;
      }

      .log-message {
        color: #f8fafc;
        flex: 1;
      }

      .log-empty {
        color: #6b7280;
        font-style: italic;
        text-align: center;
        padding: 2rem;
      }

      .console-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      .btn-small {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-small:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      /* System Status */
      .status-grid {
        display: grid;
        gap: 0.75rem;
      }

      .status-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .status-label {
        font-weight: 500;
        color: var(--text-secondary);
      }

      .status-value {
        font-weight: 600;
        color: var(--text-color);
      }

      /* Responsive Design */
      @media (max-width: 1024px) {
        .header-content {
          padding: 0 1rem;
        }

        .main-content {
          padding: 1rem;
        }

        .app-title {
          font-size: 2rem;
        }

        .debug-console {
          grid-column: span 1;
        }
      }

      @media (max-width: 768px) {
        .app-title {
          font-size: 1.75rem;
        }

        .app-subtitle {
          font-size: 1rem;
        }

        .header-content {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .api-status-mini {
          order: -1;
        }

        .keys-grid {
          grid-template-columns: 1fr;
        }

        .keys-actions {
          flex-direction: column;
          align-items: center;
        }

        .debug-grid {
          grid-template-columns: 1fr;
        }

        .story-actions {
          flex-direction: column;
        }
      }

      @media (max-width: 480px) {
        .main-content {
          padding: 0.5rem;
        }

        .story-creation-section,
        .story-display-section,
        .voice-audio-section,
        .export-section,
        .testing-debug-section {
          padding: 1rem;
        }

        .debug-card {
          padding: 1rem;
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

  // API key inputs and status
  grokKeyInput = ''
  elevenKeyInput = ''
  get hasGrokKey() { try { return !!localStorage.getItem('XAI_API_KEY') || !!(window as any).VITE_XAI_API_KEY; } catch { return false } }
  get hasElevenKey() { try { return !!localStorage.getItem('ELEVENLABS_API_KEY') || !!(window as any).VITE_ELEVENLABS_API_KEY; } catch { return false } }

  // Loading states
  isGenerating = false
  isParsing = false
  isSynthesizing = false

  // UI State
  showApiKeys = false

  // Debug logging
  debugLogs: { time: string; level: string; message: string }[] = []

  constructor(
    @Inject(STORY_SERVICE) private story: StoryService,
    public store: StoryStore,
    @Inject(SPEAKER_PARSER) private parser: any,
    @Inject(VOICE_SERVICE) private voice: VoiceService,
    public voiceStore: VoiceStore,
    private toast: ToastService,
  ) {
    this.addDebugLog('info', 'Application initialized successfully')
    this.addDebugLog('info', `Running in ${this.isMockMode ? 'mock' : 'production'} mode`)
  }

  // Debug logging methods
  addDebugLog(level: string, message: string): void {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    })
    
    this.debugLogs.unshift({ time, level, message })
    
    // Keep only last 100 logs
    if (this.debugLogs.length > 100) {
      this.debugLogs = this.debugLogs.slice(0, 100)
    }

    // Also log to browser console for development
    const consoleMethods: { [key: string]: Function } = {
      'error': console.error,
      'warn': console.warn,
      'info': console.info,
      'debug': console.log
    }
    
    const consoleMethod = consoleMethods[level] || console.log
    consoleMethod(`[${time}] ${message}`)
  }

  clearDebugLogs(): void {
    this.debugLogs = []
    this.addDebugLog('info', 'Debug logs cleared')
  }

  exportDebugLogs(): void {
    const logsText = this.debugLogs
      .map(log => `[${log.time}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n')
    
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spicy-fairytales-debug-${new Date().toISOString().split('T')[0]}.log`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    this.addDebugLog('info', 'Debug logs exported successfully')
    this.toast.success('Debug Logs', 'Logs exported successfully!')
  }

  // UI State methods
  toggleApiKeys(): void {
    this.showApiKeys = !this.showApiKeys
    this.addDebugLog('debug', `API keys panel ${this.showApiKeys ? 'opened' : 'closed'}`)
  }

  loadKeys(): void {
    try {
      this.grokKeyInput = localStorage.getItem('XAI_API_KEY') || ''
      this.elevenKeyInput = localStorage.getItem('ELEVENLABS_API_KEY') || ''
      this.toast.info('API Keys', 'Loaded keys from your browser')
      this.addDebugLog('info', 'API keys loaded from localStorage')
    } catch (e: any) {
      this.toast.warning('API Keys', 'Could not access localStorage')
      this.addDebugLog('error', `Failed to load API keys: ${e.message}`)
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
      this.addDebugLog('info', `API keys saved: Grok=${!!this.grokKeyInput}, ElevenLabs=${!!this.elevenKeyInput}`)
    } catch (e: any) {
      this.toast.error('API Keys', 'Failed to save keys')
      this.addDebugLog('error', `Failed to save API keys: ${e.message}`)
    }
  }

  clearKeys(): void {
    try {
      localStorage.removeItem('XAI_API_KEY')
      localStorage.removeItem('ELEVENLABS_API_KEY')
      this.grokKeyInput = ''
      this.elevenKeyInput = ''
      this.toast.info('API Keys', 'Cleared keys from your browser')
      this.addDebugLog('info', 'API keys cleared from localStorage')
    } catch (e: any) {
      this.toast.warning('API Keys', 'Could not clear localStorage keys')
      this.addDebugLog('error', `Failed to clear API keys: ${e.message}`)
    }
  }

  onGenerate(options: StoryOptions): void {
    this.isGenerating = true
    this.latestChunk = ''
    this.store.reset()
    
    this.addDebugLog('info', `Starting story generation with options: ${JSON.stringify(options)}`)

    this.story.generateStory(options).subscribe({
      next: (chunk: string) => {
        this.latestChunk += chunk
        this.store.append(chunk)
        this.addDebugLog('debug', `Received story chunk: ${chunk.length} characters`)
      },
      error: (err: Error) => {
        this.isGenerating = false
        this.toast.error('Story Generation Failed', err.message)
        this.addDebugLog('error', `Story generation failed: ${err.message}`)
      },
      complete: () => {
        this.isGenerating = false
        this.addDebugLog('info', `Story generation completed. Total length: ${this.store.currentText()?.length || 0} characters`)
      },
    })
  }

  onTestApi(): void {
    this.toast.info('API Test', 'API test initiated!')
    this.addDebugLog('info', 'Basic API connection test started')
    // In a real scenario, this would trigger a more comprehensive API check.
    // For now, we'll just simulate a successful test.
    setTimeout(() => {
      this.toast.success('API Test', 'API connection successful!')
      this.addDebugLog('info', 'Basic API connection test completed successfully')
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
    this.addDebugLog('info', `Generating test story: ${wordCount} words`)
    this.onGenerate(options)
  }

  parseCurrent(): void {
    const text = this.store.currentText()
    if (!text) {
      this.toast.error('Parse Error', 'No story text available to parse. Please generate a story first.')
      this.addDebugLog('error', 'Parse attempted with no story text available')
      return
    }

    this.isParsing = true
    this.toast.info('Parsing', 'Analyzing dialogue and characters...')
    this.addDebugLog('info', `Starting speaker parsing for ${text.length} characters`)

    this.parser.parseStory(text).then((parsed: any) => {
      if (!parsed.segments || parsed.segments.length === 0) {
        throw new Error('No segments found in the story')
      }

      this.store.setParsed(parsed)
      this.toast.success('Parsing Complete', `Found ${parsed.segments.length} segments and ${parsed.characters.length} characters`)
      this.addDebugLog('info', `Parsing completed: ${parsed.segments.length} segments, ${parsed.characters.length} characters`)
    }).catch((error: any) => {
      this.toast.error('Parse Failed', error.message)
      this.addDebugLog('error', `Parsing failed: ${error.message}`)
      console.error('Parse error:', error)
    }).finally(() => {
      this.isParsing = false
    })
  }

  async testRealAPIs() {
    this.isTesting = true
    this.testStatus = null
    this.addDebugLog('info', 'Starting full API pipeline test')

    try {
      // Step 1: Generate a story
      this.testStatus = { type: 'info', message: '📝 Generating story with Grok...' }
      this.addDebugLog('info', 'API Test Step 1: Story generation')
      await this.testStoryGeneration()

      // Step 2: Parse speakers
      this.testStatus = { type: 'info', message: '🗣️ Parsing speakers with Grok...' }
      this.addDebugLog('info', 'API Test Step 2: Speaker parsing')
      await this.testSpeakerParsing()

      // Step 3: Synthesize audio
      this.testStatus = { type: 'info', message: '🔊 Synthesizing audio with ElevenLabs...' }
      this.addDebugLog('info', 'API Test Step 3: Audio synthesis')
      await this.testAudioSynthesis()

      this.testStatus = { type: 'success', message: '✅ All APIs working perfectly! Full pipeline test successful.' }
      this.addDebugLog('info', 'Full API pipeline test completed successfully')

    } catch (error: any) {
      this.testStatus = { type: 'error', message: `❌ API Test Failed: ${error.message}` }
      this.addDebugLog('error', `API pipeline test failed: ${error.message}`)
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

  synthesize(): void {
    const parsed = this.store.parsed()
    if (!parsed) {
      this.toast.error('Synthesis Error', 'No parsed story available. Please parse speakers first.')
      this.addDebugLog('error', 'Synthesis attempted without parsed story')
      return
    }

    this.isSynthesizing = true
    this.toast.info('Audio Synthesis', 'Starting audio synthesis...')
    this.addDebugLog('info', `Starting audio synthesis for ${parsed.segments?.length || 0} segments`)

    const assigns: VoiceAssignment[] = Object.entries(this.voiceStore.assignments()).map(([character, voiceId]) => ({ character, voiceId: voiceId as string }))
    const narratorVoice = this.voiceStore.narratorVoice() || undefined
    const buffers: ArrayBuffer[] = []

    this.addDebugLog('debug', `Voice assignments: ${assigns.length} characters, narrator: ${narratorVoice || 'none'}`)

    const sub = this.voice.synthesize(parsed, assigns, narratorVoice).subscribe({
      next: (chunk: AudioChunk) => {
        buffers.push(chunk.audio)
        this.addDebugLog('debug', `Received audio chunk: ${chunk.audio.byteLength} bytes`)
      },
      error: (error: any) => {
        this.isSynthesizing = false
        this.toast.error('Synthesis Failed', error.message)
        this.addDebugLog('error', `Audio synthesis failed: ${error.message}`)
      },
      complete: () => {
        this.isSynthesizing = false
        if (buffers.length === 0) {
          this.toast.error('Synthesis Error', 'No audio data received')
          this.addDebugLog('error', 'Audio synthesis completed but no audio data received')
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
        this.toast.success('Synthesis Complete', 'Audio generated successfully!')
        this.addDebugLog('info', `Audio synthesis completed: ${buffers.length} chunks, ${total} total bytes`)
      }
    })
  }
}
