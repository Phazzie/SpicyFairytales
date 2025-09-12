import { Component, EventEmitter, Output, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import type { StoryOptions } from '../../shared/contracts'

@Component({
  selector: 'app-story-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
      <div class="row">
        <label>Genre</label>
        <select formControlName="genre">
          <option value="dark-fantasy">Dark Fantasy</option>
          <option value="horror">Horror</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="mystery">Mystery</option>
        </select>
      </div>
      <div class="row">
        <label>Tone</label>
        <select formControlName="tone">
          <option value="dark">Dark</option>
          <option value="whimsical">Whimsical</option>
          <option value="dramatic">Dramatic</option>
        </select>
      </div>
      <div class="row">
        <label>Length</label>
        <select formControlName="length">
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>
      <div class="row">
        <label>Themes (comma-separated)</label>
        <input formControlName="themes" placeholder="ghosts, revenge" />
      </div>
      <div class="row">
        <label>Custom prompt</label>
        <textarea formControlName="prompt" rows="3" placeholder="Optional prompt..."></textarea>
      </div>
      <button type="submit" [disabled]="form.invalid || submitting()">{{ submitting() ? 'Generating…' : 'Generate' }}</button>
    </form>
  `,
  styles: [
    `
      .form { display: grid; gap: 0.75rem; }
      .row { display: grid; gap: 0.25rem; }
      label { font-weight: 600; }
      input, select, textarea { padding: 0.5rem; }
      button { padding: 0.5rem 0.75rem; }
    `,
  ],
})
export class StoryFormComponent {
  @Output() optionsSubmit = new EventEmitter<StoryOptions>()
  protected submitting = signal(false)

  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      genre: ['dark-fantasy', Validators.required],
      tone: ['dark', Validators.required],
      length: ['short', Validators.required],
      themes: [''],
      prompt: [''],
    })
  }

  onSubmit() {
    if (this.form.invalid) return
    this.submitting.set(true)
    const v = this.form.value
    const options: StoryOptions = {
      genre: v.genre,
      tone: v.tone,
      length: v.length,
      themes: (v.themes as string)?.split(',').map((t) => t.trim()).filter(Boolean),
      prompt: v.prompt || undefined,
    }
    this.optionsSubmit.emit(options)
  }

  resetSubmitting() {
    this.submitting.set(false)
  }
}
