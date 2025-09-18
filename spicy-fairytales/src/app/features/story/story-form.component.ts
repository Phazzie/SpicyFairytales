/**
 * Primary user interface for configuring story generation parameters and initiating creation.
 * 
 * Reactive form component that collects user preferences and transforms them into StoryOptions
 * for the generation pipeline. Features character type selection, genre/tone configuration,
 * spice level adjustment, and custom theme/idea input with real-time validation.
 * 
 * INPUT: User form interactions (character type, genre, tone, length, themes, custom ideas)
 * OUTPUT: StoryOptions emitted via onGenerate event to parent components
 * DEPENDENCIES: Angular Reactive Forms for validation, CommonModule for template directives
 * INTEGRATIONS: Consumed by story generation page, outputs to story generation hooks
 * VALIDATION: Required fields for core options, optional fields for enhanced customization
 * UX: Multi-section layout with visual character selection and progressive disclosure
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

      <!-- Story Themes & Concepts (Condensed) -->
      <div class="form-section condensed">
        <h3 class="section-title">🎨 Story Themes</h3>
        <div class="themes-compact">
          <label class="theme-chip" *ngFor="let theme of availableThemes">
            <input type="checkbox" [value]="theme.id" (change)="onThemeToggle(theme.id, $event)" />
            <div class="chip-content">
              <span class="chip-icon">{{ theme.icon }}</span>
              <span class="chip-name">{{ theme.name }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Time Period Selector -->
      <div class="form-section">
        <h3 class="section-title">⏰ Time Period</h3>
        <div class="period-options">
          <label class="period-option" *ngFor="let period of timePeriods" [class.selected]="form.get('timePeriod')?.value === period.id">
            <input type="radio" formControlName="timePeriod" [value]="period.id" />
            <div class="period-card">
              <div class="period-icon">{{ period.icon }}</div>
              <div class="period-name">{{ period.name }}</div>
              <div class="period-desc">{{ period.desc }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Magic System Dial -->
      <div class="form-section">
        <h3 class="section-title">✨ Magic System: {{ form.get('magicSystem')?.value }}/10</h3>
        <div class="magic-dial">
          <input
            type="range"
            formControlName="magicSystem"
            min="1"
            max="10"
            step="1"
            class="magic-slider"
          />
          <div class="magic-labels">
            <span class="magic-label">Mundane</span>
            <span class="magic-label">Mystical</span>
            <span class="magic-label">Arcane</span>
          </div>
        </div>
        <p class="magic-description">{{ getMagicDescription(form.get('magicSystem')?.value) }}</p>
      </div>

      <!-- Spicy Level Meter -->
      <div class="form-section">
        <h3 class="section-title">🌶️ Heat Level: {{ form.get('spicyLevel')?.value }}/10</h3>
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
            <span class="spicy-label">Innocent</span>
            <span class="spicy-label">Warm</span>
            <span class="spicy-label">Volcanic</span>
            <span class="spicy-label">Supernova</span>
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

      <!-- Test Buttons - Moved to Parent Component -->
    </form>
  `,
  styles: [
    `
      .story-form {
        display: grid;
        gap: var(--space-xl);
        max-width: 900px;
        margin: 0 auto;
      }

      .form-section {
        background: var(--card-bg);
        backdrop-filter: var(--glass-backdrop);
        border: 1px solid var(--glass-border);
        border-radius: var(--glass-border-radius);
        padding: var(--space-xl);
        box-shadow: var(--glass-shadow);
        transition: all var(--transition-normal);
        position: relative;
        overflow: hidden;
      }

      .form-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
      }

      .form-section:hover {
        transform: translateY(-2px);
        box-shadow: 
          var(--shadow-xl),
          0 0 25px rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.2);
      }

      .form-section.condensed {
        padding: var(--space-lg);
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: var(--space-lg);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* Character Selection - Enhanced */
      .character-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-lg);
      }

      .character-option {
        cursor: pointer;
        transition: all var(--transition-normal);
        position: relative;
      }

      .character-option input[type="radio"] {
        display: none;
      }

      .character-option.selected .character-card {
        background: var(--accent-gradient);
        color: white;
        transform: translateY(-4px) scale(1.02);
        box-shadow: 
          var(--shadow-xl),
          0 0 30px rgba(99, 102, 241, 0.4);
        border-color: var(--primary-500);
      }

      .character-option.selected .character-card::before {
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      }

      .character-card {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: var(--glass-border-radius);
        padding: var(--space-xl);
        text-align: center;
        transition: all var(--transition-normal);
        backdrop-filter: var(--glass-backdrop);
        position: relative;
        overflow: hidden;
      }

      .character-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
      }

      .character-card:hover {
        transform: translateY(-3px) scale(1.01);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-500);
      }

      .character-icon {
        font-size: 3rem;
        margin-bottom: var(--space-md);
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      }

      .character-name {
        font-weight: 700;
        font-size: 1.25rem;
        margin-bottom: var(--space-sm);
        color: var(--text-color);
      }

      .character-desc {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .character-option.selected .character-desc {
        color: rgba(255, 255, 255, 0.9);
      }

      /* Theme Chips - Modern Pills */
      .themes-compact {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
      }

      .theme-chip {
        cursor: pointer;
        transition: all var(--transition-normal);
        position: relative;
      }

      .theme-chip input[type="checkbox"] {
        display: none;
      }

      .chip-content {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-sm) var(--space-md);
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-secondary);
        transition: all var(--transition-normal);
        backdrop-filter: var(--glass-backdrop);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .chip-content:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        border-color: var(--primary-500);
      }

      .theme-chip input[type="checkbox"]:checked + .chip-content {
        background: var(--accent-gradient);
        color: white;
        border-color: var(--primary-600);
        transform: translateY(-2px) scale(1.05);
        box-shadow: 
          0 6px 20px rgba(99, 102, 241, 0.3),
          0 0 15px rgba(99, 102, 241, 0.2);
      }

      .chip-icon {
        font-size: 1.1rem;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      }

      .chip-content {
        background: var(--bg-primary, white);
        border: 2px solid var(--border-color, #ddd);
        border-radius: 20px;
        padding: 0.5rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .chip-content:hover {
        border-color: var(--accent-color, #007bff);
        box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
      }

      .chip-icon {
        font-size: 1rem;
      }

      .chip-name {
        font-weight: 500;
      }

      /* Period Selection */
      .period-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }

      .period-option {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .period-option input[type="radio"] {
        display: none;
      }

      .period-option.selected .period-card {
        border-color: var(--accent-color, #007bff);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        transform: translateY(-2px);
      }

      .period-card {
        background: var(--bg-primary, white);
        border: 2px solid transparent;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .period-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .period-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }

      .period-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: var(--text-primary, #333);
        font-size: 0.9rem;
      }

      .period-desc {
        font-size: 0.75rem;
        color: var(--text-muted, #666);
      }

      /* Magic System Dial */
      .magic-dial {
        margin: 1rem 0;
      }

      .magic-slider {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(to right, #9ca3af, #6366f1, #8b5cf6, #d946ef, #ec4899);
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
      }

      .magic-slider::-webkit-slider-thumb {
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

      .magic-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--bg-primary, white);
        border: 2px solid var(--text-primary, #333);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .magic-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--text-muted, #666);
      }

      .magic-description {
        margin-top: 0.5rem;
        font-style: italic;
        color: var(--text-muted, #666);
        text-align: center;
        font-size: 0.9rem;
      }

      /* Condensed form section */
      .form-section.condensed {
        padding: 1rem;
      }

      .form-section.condensed .section-title {
        font-size: 1.1rem;
        margin-bottom: 0.75rem;
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

      /* Test Buttons */
      .test-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .test-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        background-color: var(--accent-color-secondary, #6c757d);
        color: white;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .test-btn:hover {
        background-color: var(--accent-color-secondary-hover, #5a6268);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .character-options,
        .period-options,
        .length-options {
          grid-template-columns: 1fr;
        }

        .themes-compact {
          justify-content: center;
        }

        .section-title {
          font-size: 1.1rem;
        }

        .character-card,
        .period-card,
        .length-card {
          padding: 0.75rem;
        }

        .chip-content {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class StoryFormComponent {
  @Output() optionsSubmit = new EventEmitter<StoryOptions>()
  @Output() onGenerate = new EventEmitter<StoryOptions>()
  @Output() onTestApi = new EventEmitter<void>()
  @Output() onGenerateTestStory = new EventEmitter<number>()

  protected submitting = signal(false)

  // Available themes for selection (condensed)
  protected availableThemes = [
    { id: 'romance', name: 'Romance', icon: '💕' },
    { id: 'forbidden', name: 'Forbidden', icon: '🚫' },
    { id: 'power', name: 'Power', icon: '👑' },
    { id: 'revenge', name: 'Revenge', icon: '⚔️' },
    { id: 'seduction', name: 'Seduction', icon: '😘' },
    { id: 'supernatural', name: 'Supernatural', icon: '👻' },
    { id: 'magic', name: 'Magic', icon: '✨' },
    { id: 'betrayal', name: 'Betrayal', icon: '🗡️' }
  ]

  // Time period options
  protected timePeriods = [
    { id: 'ancient', name: 'Ancient', icon: '🏛️', desc: 'Gods & legends' },
    { id: 'medieval', name: 'Medieval', icon: '🏰', desc: 'Knights & castles' },
    { id: 'renaissance', name: 'Renaissance', icon: '🎭', desc: 'Art & intrigue' },
    { id: 'victorian', name: 'Victorian', icon: '🎩', desc: 'Gothic elegance' },
    { id: 'modern', name: 'Modern', icon: '🏙️', desc: 'Contemporary world' },
    { id: 'futuristic', name: 'Futuristic', icon: '🚀', desc: 'Sci-fi future' }
  ]

  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      characterType: ['werewolf', Validators.required],
      selectedThemes: [[]],
      spicyLevel: [5],
      userIdeas: [''],
      length: ['medium', Validators.required],
      timePeriod: ['modern', Validators.required],
      magicSystem: [5]
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
      1: 'Innocent Whispers - pure and wholesome storytelling',
      2: 'Gentle Breeze - subtle romantic tension builds',
      3: 'Warm Embers - mild heat with tender moments',
      4: 'Dancing Flames - romantic chemistry ignites',
      5: 'Burning Desire - balanced passion and emotion',
      6: 'Wildfire Hearts - intense romantic encounters',
      7: 'Molten Passion - explicit romantic content',
      8: 'Volcanic Eruption - raw, uninhibited desire', 
      9: 'Solar Flare - extremely intense erotic content',
      10: 'Supernova Intensity - maximum heat and passion'
    }
    return descriptions[level as keyof typeof descriptions] || descriptions[5]
  }

  getMagicDescription(level: number): string {
    const descriptions = {
      1: 'Mundane World - no magic, pure realism',
      2: 'Subtle Mysteries - hints of the supernatural',
      3: 'Hidden Powers - magic exists but concealed',
      4: 'Emerging Magic - supernatural becomes visible',
      5: 'Balanced Realm - magic and reality coexist',
      6: 'Enchanted World - magic is common knowledge',
      7: 'Spell-Weaver\'s Domain - magic shapes society',
      8: 'Arcane Mastery - powerful magical forces',
      9: 'Reality Bender - magic rewrites natural laws',
      10: 'Pure Sorcery - magic dominates everything'
    }
    return descriptions[level as keyof typeof descriptions] || descriptions[5]
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submitting.set(true)
      this.onGenerate.emit(this.form.value as StoryOptions)
      // Reset submitting state after a delay to show feedback
      setTimeout(() => this.submitting.set(false), 3000)
    }
  }

  resetSubmitting() {
    this.submitting.set(false)
  }
}
