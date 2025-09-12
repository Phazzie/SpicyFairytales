import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VoiceRecommendation } from '../../services/voice-assignment.service'

@Component({
  selector: 'app-smart-voice-recommendations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="smart-recommendations" *ngIf="recommendations.length > 0">
      <header class="recommendations-header">
        <h4>🎭 Smart Voice Recommendations</h4>
        <p>AI-powered suggestions based on character traits</p>
      </header>

      <div class="recommendations-grid">
        <div
          *ngFor="let rec of recommendations"
          class="recommendation-card"
          [class.high-confidence]="rec.confidence > 0.7"
          [class.medium-confidence]="rec.confidence > 0.4 && rec.confidence <= 0.7"
          [class.low-confidence]="rec.confidence <= 0.4"
        >
          <div class="character-info">
            <strong>{{ rec.character }}</strong>
            <div class="confidence-indicator">
              <span class="confidence-label">Confidence:</span>
              <span class="confidence-value">{{ (rec.confidence * 100) | number:'1.0-0' }}%</span>
            </div>
          </div>

          <div class="voice-recommendation">
            <div class="primary-voice">
              <span class="voice-name">{{ getVoiceName(rec.recommendedVoiceId) }}</span>
              <button
                class="accept-btn"
                (click)="onAccept(rec)"
                [disabled]="!rec.recommendedVoiceId"
              >
                ✓ Accept
              </button>
            </div>

            <div class="reasoning">
              <small>{{ rec.reasoning }}</small>
            </div>
          </div>

          <div class="alternatives" *ngIf="rec.alternatives && rec.alternatives.length > 0">
            <small class="alternatives-label">Alternatives:</small>
            <div class="alternative-options">
              <button
                *ngFor="let alt of rec.alternatives"
                class="alternative-btn"
                (click)="onAcceptAlternative(rec.character, alt.voiceId)"
                [title]="alt.reasoning"
              >
                {{ getVoiceName(alt.voiceId) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="accept-all-btn" (click)="onAcceptAll()">
          ✅ Accept All Recommendations
        </button>
        <button class="dismiss-btn" (click)="onDismiss()">
          ✕ Dismiss
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .smart-recommendations {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1rem 0;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .recommendations-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .recommendations-header h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .recommendations-header p {
        margin: 0;
        opacity: 0.9;
        font-size: 0.9rem;
      }

      .recommendations-grid {
        display: grid;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .recommendation-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .high-confidence {
        border-color: #4ade80;
        box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.3);
      }

      .medium-confidence {
        border-color: #fbbf24;
        box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.3);
      }

      .low-confidence {
        border-color: #f87171;
        box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.3);
      }

      .character-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .confidence-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
      }

      .confidence-label {
        opacity: 0.8;
      }

      .voice-recommendation {
        margin-bottom: 0.75rem;
      }

      .primary-voice {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .voice-name {
        font-weight: 600;
        font-size: 1.1rem;
      }

      .accept-btn {
        background: #4ade80;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .accept-btn:hover:not(:disabled) {
        background: #22c55e;
        transform: translateY(-1px);
      }

      .accept-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .reasoning {
        opacity: 0.9;
        font-style: italic;
      }

      .alternatives {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 0.75rem;
      }

      .alternatives-label {
        opacity: 0.8;
        margin-bottom: 0.5rem;
        display: block;
      }

      .alternative-options {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .alternative-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alternative-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .accept-all-btn {
        background: #4ade80;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .accept-all-btn:hover {
        background: #22c55e;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .dismiss-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dismiss-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    `,
  ],
})
export class SmartVoiceRecommendationsComponent {
  @Input() recommendations: VoiceRecommendation[] = []
  @Input() voices: { id: string; name: string }[] = []
  @Output() acceptRecommendation = new EventEmitter<VoiceRecommendation>()
  @Output() acceptAlternative = new EventEmitter<{ character: string; voiceId: string }>()
  @Output() acceptAll = new EventEmitter<VoiceRecommendation[]>()
  @Output() dismiss = new EventEmitter<void>()

  getVoiceName(voiceId: string): string {
    const voice = this.voices.find(v => v.id === voiceId)
    return voice ? voice.name : voiceId
  }

  onAccept(rec: VoiceRecommendation): void {
    this.acceptRecommendation.emit(rec)
  }

  onAcceptAlternative(character: string, voiceId: string): void {
    this.acceptAlternative.emit({ character, voiceId })
  }

  onAcceptAll(): void {
    this.acceptAll.emit(this.recommendations)
  }

  onDismiss(): void {
    this.dismiss.emit()
  }
}