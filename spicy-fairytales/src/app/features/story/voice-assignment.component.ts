import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { VoiceStore } from '../../stores/voice.store'
import { VoiceAssignmentService } from '../../services/voice-assignment.service'
import { ParsedStory, VoiceAssignment, NarratorVoiceAssignment } from '../../shared/contracts'

@Component({
  selector: 'app-voice-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="voice-assignment">
      <h3>Voice Assignments</h3>

      <!-- Narrator Voice Section -->
      <section class="narrator-section">
        <h4>Narrator Voice</h4>
        <div class="voice-selector">
          <select
            [value]="narratorVoice()?.voiceId || ''"
            (change)="onNarratorVoiceChange($event)"
            class="voice-select">
            <option value="">Select Narrator Voice...</option>
            <option *ngFor="let voice of voices()" [value]="voice.id">
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
      </section>

      <!-- Character Voices Section -->
      <section class="characters-section" *ngIf="parsedStory()">
        <h4>Character Voices</h4>
        <div class="character-assignments">
          <div *ngFor="let character of parsedStory()!.characters" class="character-assignment">
            <label class="character-label">{{ character.name }}</label>
            <div class="voice-selector">
              <select
                [value]="getCharacterVoice(character.name)"
                (change)="onCharacterVoiceChange(character.name, $event)"
                class="voice-select">
                <option value="">Select Voice...</option>
                <option *ngFor="let voice of voices()" [value]="voice.id">
                  {{ voice.name }}
                </option>
              </select>
              <button
                *ngIf="getCharacterVoice(character.name)"
                (click)="clearCharacterVoice(character.name)"
                class="clear-btn"
                type="button">
                Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Smart Assignment Button -->
        <div class="smart-assignment">
          <button
            (click)="generateSmartAssignments()"
            [disabled]="!parsedStory() || isGenerating()"
            class="smart-btn">
            {{ isGenerating() ? 'Generating...' : 'Smart Voice Assignment' }}
          </button>
          <p class="help-text">
            AI-powered voice recommendations based on character traits and story context
          </p>
        </div>
      </section>

      <!-- Action Buttons -->
      <div class="actions">
        <button
          (click)="applyAssignments()"
          [disabled]="!hasValidAssignments()"
          class="apply-btn">
          Apply Voice Assignments
        </button>
        <button (click)="cancel.emit()" class="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [`
    .voice-assignment {
      max-width: 600px;
      margin: 0 auto;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h3 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    h4 {
      margin: 1.5rem 0 1rem 0;
      color: #34495e;
      font-size: 1.2rem;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 0.5rem;
    }

    .voice-selector {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .voice-select {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #ecf0f1;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
      transition: border-color 0.2s;
    }

    .voice-select:focus {
      outline: none;
      border-color: #3498db;
    }

    .clear-btn {
      padding: 0.5rem 1rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }

    .clear-btn:hover {
      background: #c0392b;
    }

    .character-assignment {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .character-label {
      min-width: 120px;
      font-weight: 600;
      color: #2c3e50;
    }

    .smart-assignment {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #ecf0f1;
      border-radius: 8px;
      text-align: center;
    }

    .smart-btn {
      padding: 0.75rem 1.5rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .smart-btn:hover:not(:disabled) {
      background: #229954;
    }

    .smart-btn:disabled {
      background: #95a5a6;
      cursor: not-allowed;
    }

    .help-text {
      margin: 0.5rem 0 0 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #ecf0f1;
    }

    .apply-btn {
      padding: 0.75rem 1.5rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .apply-btn:hover:not(:disabled) {
      background: #2980b9;
    }

    .apply-btn:disabled {
      background: #95a5a6;
      cursor: not-allowed;
    }

    .cancel-btn {
      padding: 0.75rem 1.5rem;
      background: #ecf0f1;
      color: #2c3e50;
      border: 2px solid #bdc3c7;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .cancel-btn:hover {
      background: #d5dbdb;
      border-color: #95a5a6;
    }
  `]
})
export class VoiceAssignmentComponent {
  private voiceStore = inject(VoiceStore)
  private voiceAssignmentService = inject(VoiceAssignmentService)

  @Input() parsedStory = signal<ParsedStory | null>(null)
  @Output() assignmentsApplied = new EventEmitter<{
    characterAssignments: VoiceAssignment[]
    narratorVoice: NarratorVoiceAssignment | null
  }>()
  @Output() cancel = new EventEmitter<void>()

  voices = this.voiceStore.voices
  narratorVoice = this.voiceStore.narratorVoice
  isGenerating = signal(false)

  getCharacterVoice(characterName: string): string {
    return this.voiceStore.assignments()[characterName] || ''
  }

  onNarratorVoiceChange(event: Event) {
    const target = event.target as HTMLSelectElement
    const voiceId = target.value
    const voice = this.voices().find(v => v.id === voiceId)

    if (voiceId && voice) {
      this.voiceStore.setNarratorVoice({
        voiceId,
        name: voice.name
      })
    }
  }

  clearNarratorVoice() {
    this.voiceStore.clearNarratorVoice()
  }

  onCharacterVoiceChange(characterName: string, event: Event) {
    const target = event.target as HTMLSelectElement
    const voiceId = target.value

    if (voiceId) {
      this.voiceStore.setAssignment(characterName, voiceId)
    } else {
      this.clearCharacterVoice(characterName)
    }
  }

  clearCharacterVoice(characterName: string) {
    const assignments = { ...this.voiceStore.assignments() }
    delete assignments[characterName]
    this.voiceStore.assignments.set(assignments)
  }

  async generateSmartAssignments() {
    if (!this.parsedStory()) return

    this.isGenerating.set(true)
    try {
      const storyText = this.parsedStory()!.segments.map(s => s.text).join(' ')

      // Generate character voice recommendations
      const recommendations = await this.voiceAssignmentService.generateSmartAssignments(storyText)

      // Apply character recommendations to store
      recommendations.forEach(rec => {
        this.voiceStore.setAssignment(rec.character, rec.recommendedVoiceId)
      })

      // Generate narrator voice recommendation
      const narratorRecommendation = this.voiceAssignmentService.recommendNarratorVoice(storyText)
      this.voiceStore.setNarratorVoice({
        voiceId: narratorRecommendation.voiceId,
        name: narratorRecommendation.name
      })
    } catch (error) {
      console.error('Failed to generate smart assignments:', error)
    } finally {
      this.isGenerating.set(false)
    }
  }

  hasValidAssignments(): boolean {
    const assignments = this.voiceStore.assignments()
    const narratorVoice = this.narratorVoice()

    // At minimum, we need either some character assignments or a narrator voice
    return Object.keys(assignments).length > 0 || !!narratorVoice
  }

  applyAssignments() {
    const characterAssignments: VoiceAssignment[] = Object.entries(this.voiceStore.assignments()).map(
      ([character, voiceId]) => ({ character, voiceId })
    )

    this.assignmentsApplied.emit({
      characterAssignments,
      narratorVoice: this.narratorVoice()
    })
  }
}