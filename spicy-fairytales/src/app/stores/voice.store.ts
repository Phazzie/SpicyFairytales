import { Injectable, computed, signal } from '@angular/core'

export interface VoiceInfo { id: string; name: string }

@Injectable({ providedIn: 'root' })
export class VoiceStore {
  readonly voices = signal<VoiceInfo[]>([])
  // map character -> voiceId
  readonly assignments = signal<Record<string, string>>({})

  setVoices(v: VoiceInfo[]) {
    this.voices.set(v)
  }

  setAssignment(character: string, voiceId: string) {
    this.assignments.update((a) => ({ ...a, [character]: voiceId }))
  }
}
