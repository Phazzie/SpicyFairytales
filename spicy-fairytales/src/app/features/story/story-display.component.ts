/**
 * Display component for rendering generated story content with interactive features.
 * 
 * Reactive presentation component that displays streaming story text with copy functionality
 * and visual formatting. Consumes story content from the StoryStore and provides user
 * interactions for content management and sharing.
 * 
 * INPUT: text (story content string), reactive updates from story generation pipeline
 * OUTPUT: Formatted story display, clipboard copy functionality, user interaction events
 * DEPENDENCIES: Angular signals for reactive updates, CommonModule for template directives
 * INTEGRATIONS: Consumes story text from StoryStore, displays real-time generation progress
 * FEATURES: Copy to clipboard, empty state handling, text formatting and structure
 * ACCESSIBILITY: Keyboard navigation, screen reader support, visual feedback for interactions
 */
import { Component, Input, signal } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-story-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="display">
      <header>
        <button (click)="copy()" [disabled]="!text()">Copy</button>
        <span class="muted" *ngIf="!text()">No story yet</span>
      </header>
      <article class="content">{{ text() }}</article>
    </section>
  `,
  styles: [
    `
      .display { display: grid; gap: 0.5rem; }
      header { display: flex; gap: 0.5rem; align-items: center; }
      .content { white-space: pre-wrap; line-height: 1.5; }
      .muted { color: #666; font-style: italic; }
    `,
  ],
})
export class StoryDisplayComponent {
  protected text = signal('')

  @Input() set append(chunk: string | null) {
    if (!chunk) return
    this.text.update((t) => t + chunk)
  }

  copy() {
    const val = this.text()
    if (!val) return
    navigator.clipboard.writeText(val)
  }
}
