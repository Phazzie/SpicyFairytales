import { Component, Inject, effect, signal, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VoiceStore } from '../../stores/voice.store'
import { StoryStore } from '../../stores/story.store'
import { VOICE_SERVICE } from '../../shared/tokens'
import type { VoiceService } from '../../shared/contracts'
import { VoiceRecommendation } from '../../shared/contracts'
import { SmartVoiceRecommendationsComponent } from './smart-voice-recommendations.component'

@Component({
  selector: 'app-character-voices',
  standalone: true,
  imports: [CommonModule, SmartVoiceRecommendationsComponent],
  template: `
    <section class="voices">
      <header class="voices-header">
        <h3>🎭 Voice Assignments</h3>
        <div class="header-actions">
          <button
            class="smart-assign-btn"
            (click)="onRequestSmartAssignments()"
            [disabled]="isGeneratingSmartAssignments() || characters().length === 0"
          >
            {{ isGeneratingSmartAssignments() ? '🤖 Analyzing...' : '🧠 Smart Assign' }}
          </button>
          <button (click)="onRequestLoadVoices()" [disabled]="isLoadingVoices">
            {{ isLoadingVoices ? 'Loading...' : 'Load Voices' }}
          </button>
        </div>
      </header>

      <app-smart-voice-recommendations
        *ngIf="smartRecommendations().length > 0"
        [recommendations]="smartRecommendations()"
        [voices]="voiceStore.voices()"
        (acceptRecommendation)="onAcceptRecommendation($event)"
        (acceptAlternative)="onAcceptAlternative($event)"
        (acceptAll)="onAcceptAll($event)"
        (dismiss)="onDismissRecommendations()"
      ></app-smart-voice-recommendations>

      <!-- Narrator Voice Section -->
      <div class="narrator-section">
        <h4>📖 Narrator Voice</h4>
        <div class="voice-selector">
          <select
            [value]="narratorVoice()?.voiceId || ''"
            (change)="onNarratorVoiceChange($event)"
            class="voice-select">
            <option value="">Select Narrator Voice...</option>
            <option *ngFor="let voice of voiceStore.voices()" [value]="voice.id">
              {{ voice.name }}
            </option>
          </select>
          <button
            *ngIf="narratorVoice()"
            (click)="clearNarratorVoice()"
            class="clear-btn"
            type="button">
            Clear
          </button>
        </div>
        <p class="help-text" *ngIf="!narratorVoice()">
          Choose a voice for narration and descriptive text
        </p>
      </div>

      <div *ngIf="characters().length === 0" class="muted">No characters detected yet.</div>

      <div class="manual-assignments" *ngIf="characters().length > 0">
        <h4>Manual Voice Assignment</h4>
        <ul>
          <li *ngFor="let c of characters()">
            <strong>{{ c }}</strong>
            <select [value]="assignment(c)" (change)="onAssign(c, $any($event.target).value)">
              <option [value]="''">-- choose voice --</option>
              <option *ngFor="let v of voiceStore.voices()" [value]="v.id">{{ v.name }}</option>
            </select>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [
    `
      .voices {
        background: var(--bg-secondary, #f8f9fa);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .voices-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .voices-header h3 {
        margin: 0;
        color: var(--text-primary, #333);
        font-size: 1.25rem;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .smart-assign-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .smart-assign-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .smart-assign-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      button {
        background: var(--bg-primary, #007bff);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      button:hover:not(:disabled) {
        background: var(--bg-primary-hover, #0056b3);
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .muted {
        color: var(--text-muted, #666);
        font-style: italic;
        text-align: center;
        padding: 2rem;
      }

      .manual-assignments {
        margin-top: 1.5rem;
      }

      .manual-assignments h4 {
        margin: 0 0 1rem 0;
        color: var(--text-primary, #333);
        font-size: 1rem;
        font-weight: 600;
      }

      ul {
        list-style: none;
        padding: 0;
        display: grid;
        gap: 0.75rem;
      }

      li {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        padding: 0.75rem;
        background: var(--bg-primary, white);
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      li strong {
        min-width: 120px;
        color: var(--text-primary, #333);
      }

      select {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        background: var(--bg-primary, white);
        color: var(--text-primary, #333);
        font-size: 0.9rem;
      }

      select:focus {
        outline: none;
        border-color: var(--accent-color, #007bff);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }

      .narrator-section {
        margin: 1.5rem 0;
        padding: 1rem;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        border-radius: 8px;
        color: white;
      }

      .narrator-section h4 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .voice-selector {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .voice-select {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        font-size: 0.9rem;
      }

      .clear-btn {
        padding: 0.4rem 0.8rem;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: background-color 0.2s;
      }

      .clear-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .help-text {
        margin: 0.5rem 0 0 0;
        font-size: 0.8rem;
        opacity: 0.8;
      }
    `,
  ],
})
export class CharacterVoicesComponent {
  protected characters = signal<string[]>([])
  protected smartRecommendations = signal<VoiceRecommendation[]>([])
  protected isGeneratingSmart = false
  protected isLoadingVoices = false

  @Input() isGeneratingSmartAssignments = signal(false)
  @Output() requestLoadVoices = new EventEmitter<void>()
  @Output() requestSmartAssignments = new EventEmitter<string>()
  @Output() acceptRecommendation = new EventEmitter<VoiceRecommendation>()
  @Output() acceptAlternative = new EventEmitter<{ character: string; voiceId: string }>()
  @Output() acceptAll = new EventEmitter<VoiceRecommendation[]>()
  @Output() dismissRecommendations = new EventEmitter<void>()
  @Output() narratorVoiceChanged = new EventEmitter<{ voiceId: string; name: string }>()
  @Output() narratorVoiceCleared = new EventEmitter<void>()

  constructor(
    public voiceStore: VoiceStore,
    private stories: StoryStore,
    @Inject(VOICE_SERVICE) private voice: VoiceService
  ) {
    effect(() => {
      const parsed = this.stories.parsed()
      const uniques = new Set((parsed?.characters ?? []).map((c) => c.name))
      this.characters.set(Array.from(uniques))
    })
  }

  // Narrator Voice Property (computed)
  get narratorVoice() {
    return this.voiceStore.narratorVoice
  }

  assignment(c: string) {
    return this.voiceStore.assignments()[c] ?? ''
  }

  onAssign(c: string, voiceId: string) {
    this.voiceStore.setAssignment(c, voiceId)
  }

  onRequestLoadVoices() {
    this.requestLoadVoices.emit()
  }

  onRequestSmartAssignments() {
    const storyText = this.stories.currentText()
    if (!storyText) return

    this.requestSmartAssignments.emit(storyText)
  }

  onAcceptRecommendation(rec: VoiceRecommendation) {
    this.acceptRecommendation.emit(rec)
  }

  onAcceptAlternative(data: { character: string; voiceId: string }) {
    this.acceptAlternative.emit(data)
  }

  onAcceptAll(recommendations: VoiceRecommendation[]) {
    this.acceptAll.emit(recommendations)
  }

  onDismissRecommendations() {
    this.dismissRecommendations.emit()
  }

  // Narrator Voice Methods
  onNarratorVoiceChange(event: Event) {
    const target = event.target as HTMLSelectElement
    const voiceId = target.value
    const voice = this.voiceStore.voices().find(v => v.id === voiceId)

    if (voiceId && voice) {
      this.narratorVoiceChanged.emit({
        voiceId,
        name: voice.name
      })
    }
  }

  clearNarratorVoice() {
    this.narratorVoiceCleared.emit()
  }

  private getVoiceName(voiceId: string): string {
    const voice = this.voiceStore.voices().find(v => v.id === voiceId)
    return voice ? voice.name : voiceId
  }
}
