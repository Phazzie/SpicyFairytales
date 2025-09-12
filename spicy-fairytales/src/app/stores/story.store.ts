/**
 * Reactive store for managing story generation state and parsed story content.
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
