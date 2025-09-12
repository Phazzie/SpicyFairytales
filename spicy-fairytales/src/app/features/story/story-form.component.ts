/**
 * Form component for configuring story generation parameters and options.
 */
import { Component, EventEmitter, Output, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import type { StoryOptions } from '../../shared/contracts'

@Component({
  selector: 'app-story-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="story-form">
      <!-- Character Type Selection -->
      <div class="form-section">
        <h3 class="section-title">🎭 Choose Your Character Type</h3>
        <div class="character-options">
          <label class="character-option" [class.selected]="form.get('characterType')?.value === 'werewolf'">
            <input type="radio" formControlName="characterType" value="werewolf" />
            <div class="character-card">
              <div class="character-icon">🐺</div>
              <div class="character-name">Werewolf</div>
              <div class="character-desc">Lunar transformations, primal instincts, pack dynamics</div>
            </div>
          </label>
          <label class="character-option" [class.selected]="form.get('characterType')?.value === 'vampire'">
            <input type="radio" formControlName="characterType" value="vampire" />
            <div class="character-card">
              <div class="character-icon">🧛</div>
              <div class="character-name">Vampire</div>
              <div class="character-desc">Immortal seduction, bloodlust, eternal night</div>
            </div>
          </label>
          <label class="character-option" [class.selected]="form.get('characterType')?.value === 'faerie'">
            <input type="radio" formControlName="characterType" value="faerie" />
            <div class="character-card">
              <div class="character-icon">🧚</div>
              <div class="character-name">Faerie</div>
              <div class="character-desc">Magical mischief, ancient secrets, otherworldly allure</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Story Themes & Concepts -->
      <div class="form-section">
        <h3 class="section-title">🎨 Select Story Themes & Concepts</h3>
        <div class="themes-grid">
          <label class="theme-option" *ngFor="let theme of availableThemes">
            <input type="checkbox" [value]="theme.id" (change)="onThemeToggle(theme.id, $event)" />
            <div class="theme-card">
              <div class="theme-icon">{{ theme.icon }}</div>
              <div class="theme-name">{{ theme.name }}</div>
              <div class="theme-desc">{{ theme.description }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Spicy Level Meter -->
      <div class="form-section">
        <h3 class="section-title">🌶️ Spice Level: {{ form.get('spicyLevel')?.value }}/10</h3>
        <div class="spicy-meter">
          <input
            type="range"
            formControlName="spicyLevel"
            min="1"
            max="10"
            step="1"
            class="spicy-slider"
          />
          <div class="spicy-labels">
            <span class="spicy-label">Tame</span>
            <span class="spicy-label">Mild</span>
            <span class="spicy-label">Spicy</span>
            <span class="spicy-label">Very Spicy</span>
            <span class="spicy-label">Inferno</span>
          </div>
        </div>
        <p class="spicy-description">{{ getSpicyDescription(form.get('spicyLevel')?.value) }}</p>
      </div>

      <!-- User Ideas Input -->
      <div class="form-section">
        <h3 class="section-title">💡 Your Story Ideas (Optional)</h3>
        <textarea
          formControlName="userIdeas"
          rows="4"
          placeholder="Share your ideas, characters, plot points, or specific elements you'd like to include in your story..."
          class="ideas-input"
        ></textarea>
        <p class="help-text">The more details you provide, the more personalized your story will be!</p>
      </div>

      <!-- Story Length -->
      <div class="form-section">
        <h3 class="section-title">📏 Story Length</h3>
        <div class="length-options">
          <label class="length-option" [class.selected]="form.get('length')?.value === 'short'">
            <input type="radio" formControlName="length" value="short" />
            <div class="length-card">
              <div class="length-name">Short Story</div>
              <div class="length-words">700-900 words</div>
              <div class="length-desc">Quick, focused narrative</div>
            </div>
          </label>
          <label class="length-option" [class.selected]="form.get('length')?.value === 'medium'">
            <input type="radio" formControlName="length" value="medium" />
            <div class="length-card">
              <div class="length-name">Medium Story</div>
              <div class="length-words">900-1100 words</div>
              <div class="length-desc">Balanced, detailed tale</div>
            </div>
          </label>
          <label class="length-option" [class.selected]="form.get('length')?.value === 'long'">
            <input type="radio" formControlName="length" value="long" />
            <div class="length-card">
              <div class="length-name">Long Story</div>
              <div class="length-words">1100-1200 words</div>
              <div class="length-desc">Epic, immersive experience</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="form-actions">
        <button
          type="submit"
          [disabled]="form.invalid || submitting()"
          class="generate-btn"
        >
          {{ submitting() ? '✨ Crafting Your Story...' : '🎭 Generate Story' }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .story-form {
        display: grid;
        gap: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .form-section {
        background: var(--bg-secondary, #f8f9fa);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .section-title {
        margin: 0 0 1rem 0;
        color: var(--text-primary, #333);
        font-size: 1.25rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* Character Selection */
      .character-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .character-option {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .character-option input[type="radio"] {
        display: none;
      }

      .character-option.selected .character-card {
        border-color: var(--accent-color, #007bff);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        transform: translateY(-2px);
      }

      .character-card {
        background: var(--bg-primary, white);
        border: 2px solid transparent;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .character-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .character-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .character-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: var(--text-primary, #333);
      }

      .character-desc {
        font-size: 0.85rem;
        color: var(--text-muted, #666);
        line-height: 1.3;
      }

      /* Themes Grid */
      .themes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
      }

      .theme-option {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .theme-option input[type="checkbox"] {
        display: none;
      }

      .theme-option input[type="checkbox"]:checked + .theme-card {
        border-color: var(--accent-color, #007bff);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.05), rgba(0, 123, 255, 0.02));
      }

      .theme-card {
        background: var(--bg-primary, white);
        border: 2px solid transparent;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .theme-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .theme-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }

      .theme-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: var(--text-primary, #333);
      }

      .theme-desc {
        font-size: 0.8rem;
        color: var(--text-muted, #666);
        line-height: 1.3;
      }

      /* Spicy Meter */
      .spicy-meter {
        margin: 1rem 0;
      }

      .spicy-slider {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(to right, #4ade80, #fbbf24, #f87171, #dc2626, #7c2d12);
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
      }

      .spicy-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--bg-primary, white);
        border: 2px solid var(--text-primary, #333);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .spicy-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--bg-primary, white);
        border: 2px solid var(--text-primary, #333);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .spicy-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--text-muted, #666);
      }

      .spicy-description {
        margin-top: 0.5rem;
        font-style: italic;
        color: var(--text-muted, #666);
        text-align: center;
      }

      /* Ideas Input */
      .ideas-input {
        width: 100%;
        padding: 1rem;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 8px;
        font-family: inherit;
        font-size: 0.9rem;
        line-height: 1.4;
        resize: vertical;
        transition: border-color 0.2s ease;
      }

      .ideas-input:focus {
        outline: none;
        border-color: var(--accent-color, #007bff);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }

      .help-text {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--text-muted, #666);
        text-align: center;
      }

      /* Length Options */
      .length-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .length-option {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .length-option input[type="radio"] {
        display: none;
      }

      .length-option.selected .length-card {
        border-color: var(--accent-color, #007bff);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        transform: translateY(-2px);
      }

      .length-card {
        background: var(--bg-primary, white);
        border: 2px solid transparent;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .length-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .length-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: var(--text-primary, #333);
      }

      .length-words {
        font-size: 0.9rem;
        color: var(--accent-color, #007bff);
        margin-bottom: 0.25rem;
        font-weight: 500;
      }

      .length-desc {
        font-size: 0.8rem;
        color: var(--text-muted, #666);
      }

      /* Form Actions */
      .form-actions {
        text-align: center;
        margin-top: 1rem;
      }

      .generate-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        min-width: 200px;
      }

      .generate-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
      }

      .generate-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .character-options,
        .themes-grid,
        .length-options {
          grid-template-columns: 1fr;
        }

        .section-title {
          font-size: 1.1rem;
        }

        .character-card,
        .theme-card,
        .length-card {
          padding: 0.75rem;
        }
      }
    `,
  ],
})
export class StoryFormComponent {
  @Output() optionsSubmit = new EventEmitter<StoryOptions>()
  protected submitting = signal(false)

  // Available themes for selection
  protected availableThemes = [
    { id: 'romance', name: 'Romance', icon: '💕', description: 'Love, passion, relationships' },
    { id: 'intrigue', name: 'Intrigue', icon: '🕵️', description: 'Mystery, secrets, deception' },
    { id: 'power', name: 'Power', icon: '👑', description: 'Authority, control, dominance' },
    { id: 'forbidden', name: 'Forbidden', icon: '🚫', description: 'Taboo desires, secret affairs' },
    { id: 'transformation', name: 'Transformation', icon: '🔄', description: 'Change, evolution, rebirth' },
    { id: 'revenge', name: 'Revenge', icon: '⚔️', description: 'Justice, retribution, payback' },
    { id: 'seduction', name: 'Seduction', icon: '😘', description: 'Temptation, allure, persuasion' },
    { id: 'dark-desire', name: 'Dark Desire', icon: '🌑', description: 'Hidden cravings, forbidden lust' },
    { id: 'betrayal', name: 'Betrayal', icon: '🗡️', description: 'Deception, broken trust, revenge' },
    { id: 'immortality', name: 'Immortality', icon: '⚱️', description: 'Eternal life, timeless love' },
    { id: 'supernatural', name: 'Supernatural', icon: '👻', description: 'Ghosts, spirits, otherworldly' },
    { id: 'magic', name: 'Magic', icon: '✨', description: 'Spells, enchantments, mystical' },
    { id: 'hunt', name: 'The Hunt', icon: '🏹', description: 'Pursuit, chase, primal instinct' },
    { id: 'curse', name: 'Curse', icon: '📿', description: 'Hexes, maledictions, fate' },
    { id: 'alliance', name: 'Alliance', icon: '🤝', description: 'Partnerships, pacts, bargains' }
  ]

  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      characterType: ['werewolf', Validators.required],
      selectedThemes: [[]],
      spicyLevel: [5],
      userIdeas: [''],
      length: ['medium', Validators.required],
    })
  }

  onThemeToggle(themeId: string, event: Event) {
    const checkbox = event.target as HTMLInputElement
    const currentThemes = this.form.get('selectedThemes')?.value || []

    if (checkbox.checked) {
      this.form.patchValue({
        selectedThemes: [...currentThemes, themeId]
      })
    } else {
      this.form.patchValue({
        selectedThemes: currentThemes.filter((id: string) => id !== themeId)
      })
    }
  }

  getSpicyDescription(level: number): string {
    const descriptions = {
      1: 'Wholesome and tame - perfect for all audiences',
      2: 'Light and gentle - subtle romantic tension',
      3: 'Mild warmth - some sensual undertones',
      4: 'Noticeable heat - romantic and intimate moments',
      5: 'Balanced spice - mature themes with tasteful sensuality',
      6: 'Getting spicy - more intense romantic encounters',
      7: 'Quite spicy - explicit romantic content',
      8: 'Very spicy - intense and passionate scenes',
      9: 'Extremely spicy - highly explicit and erotic content',
      10: 'Inferno level - maximum spice and erotic intensity'
    }
    return descriptions[level as keyof typeof descriptions] || descriptions[5]
  }

  onSubmit() {
    if (this.form.invalid) return
    this.submitting.set(true)

    const v = this.form.value
    const options: StoryOptions = {
      characterType: v.characterType,
      selectedThemes: v.selectedThemes,
      spicyLevel: v.spicyLevel,
      userIdeas: v.userIdeas || undefined,
      length: v.length,
      // Keep these for backward compatibility
      genre: 'dark-fantasy',
      tone: 'dark',
      themes: v.selectedThemes,
      prompt: v.userIdeas || undefined,
    }

    this.optionsSubmit.emit(options)
  }

  resetSubmitting() {
    this.submitting.set(false)
  }
}
