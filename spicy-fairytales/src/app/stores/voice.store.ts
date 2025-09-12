/**
 * Reactive state store managing voice assignments and audio synthesis configuration.
 * 
 * Centralizes voice management for the audio generation pipeline, tracking available voices,
 * character-to-voice assignments, and narrator voice selection. Provides computed properties
 * for validation and UI state management with reactive updates.
 * 
 * INPUT: VoiceInfo[] (available voices from ElevenLabs), character assignments, narrator selection
 * OUTPUT: Reactive signals for voices, assignments, narratorVoice, and computed validation states
 * DEPENDENCIES: Angular signals for reactive state, NarratorVoiceAssignment contract
 * INTEGRATIONS: Consumed by voice management UI components, updated by voice assignment service
 * VALIDATION: Computed properties ensure all characters have voice assignments before synthesis
 * PERSISTENCE: Maintains assignment state across UI navigation and component lifecycle
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
