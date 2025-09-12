/**
 * Reactive store for managing voice assignments and audio synthesis state.
 */
import { Injectable, computed, signal } from '@angular/core'
import { NarratorVoiceAssignment } from '../shared/contracts'

export interface VoiceInfo { id: string; name: string }

@Injectable({ providedIn: 'root' })
export class VoiceStore {
  readonly voices = signal<VoiceInfo[]>([])
  // map character -> voiceId
  readonly assignments = signal<Record<string, string>>({})
  // narrator voice assignment
  readonly narratorVoice = signal<NarratorVoiceAssignment | null>(null)

  setVoices(v: VoiceInfo[]) {
    this.voices.set(v)
  }

  setAssignment(character: string, voiceId: string) {
    this.assignments.update((a) => ({ ...a, [character]: voiceId }))
  }

  setNarratorVoice(voice: NarratorVoiceAssignment) {
    this.narratorVoice.set(voice)
  }

  clearNarratorVoice() {
    this.narratorVoice.set(null)
  }
}
