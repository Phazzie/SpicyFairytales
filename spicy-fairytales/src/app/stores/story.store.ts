/**
 * Reactive state store managing story generation lifecycle and content persistence.
 * 
 * Central state management for the story generation pipeline, tracking current story text,
 * parsed segments, and user history. Uses Angular signals for reactive UI updates and
 * maintains story state across component lifecycle changes.
 * 
 * INPUT: Story text chunks from StoryService, ParsedStory from SpeakerParser
 * OUTPUT: Reactive signals for currentText, parsed story, and generation history
 * DEPENDENCIES: Angular signals for reactive state, ParsedStory contract for type safety
 * INTEGRATIONS: Consumed by story display components, updated by story generation hooks
 * STATE PERSISTENCE: Maintains 20-item history for user reference, resets current state on new generation
 * REACTIVITY: All state changes trigger UI updates via signal subscriptions
 */
import { Injectable, signal } from '@angular/core'
import type { ParsedStory } from '../shared/contracts'

@Injectable({ providedIn: 'root' })
export class StoryStore {
  readonly currentText = signal('')
  readonly parsed = signal<ParsedStory | null>(null)
  readonly history = signal<string[]>([])

  append(chunk: string) {
    this.currentText.update((t) => t + chunk)
  }

  reset() {
    const last = this.currentText()
    if (last) this.history.update((h) => [last, ...h].slice(0, 20))
    this.currentText.set('')
    this.parsed.set(null)
  }

  setParsed(ps: ParsedStory) {
    this.parsed.set(ps)
  }
}
