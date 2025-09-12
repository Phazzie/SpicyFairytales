/**
 * @fileoverview Age-based voice scoring strategy.
 *
 * ## Architecture Context
 * This strategy implements age-appropriate voice matching as part of the
 * Strategy Pattern for voice assignment. It encapsulates all age-related
 * scoring logic, making it easily testable and extensible.
 *
 * ## Information Flow
 * 1. Receives a voice and character traits from the VoiceAssignmentService
 * 2. Analyzes the character's age against voice name patterns
 * 3. Returns a score indicating how well the voice matches the age
 * 4. Provides human-readable reasoning for the score
 *
 * ## Contract Compliance
 * - Implements the `VoiceScoringStrategy` interface from contracts
 * - Pure function approach with no side effects
 * - Deterministic scoring based on character age and voice name patterns
 */

import { Injectable } from '@angular/core'
import { VoiceScoringStrategy, Voice, CharacterTraits } from '../../../shared/contracts'

@Injectable({ providedIn: 'root' })
export class AgeScoringStrategy implements VoiceScoringStrategy {
  /**
   * Score how well a voice matches a character's age.
   *
   * Scoring Rules:
   * - Child characters: +3 for 'young' voices (bella, youthful tones)
   * - Elderly characters: +3 for 'old' or 'deep' voices
   * - Teen characters: +2 for 'young' voices
   * - No age specified: 0 points (neutral)
   *
   * @param voice The voice to score
   * @param character The character traits to match against
   * @returns Score from 0-3 indicating age match quality
   */
  score(voice: Voice, character: CharacterTraits): number {
    if (!character.age) {
      return 0 // No age information available
    }

    const voiceName = voice.name.toLowerCase()

    switch (character.age) {
      case 'child':
        // Children should have young, bright voices
        return voiceName.includes('young') || voiceName.includes('bella') ? 3 : 0

      case 'elderly':
        // Elderly characters should have mature, deep voices
        return voiceName.includes('old') || voiceName.includes('deep') ? 3 : 0

      case 'teen':
        // Teens should have somewhat young voices
        return voiceName.includes('young') ? 2 : 0

      case 'young-adult':
      case 'adult':
      case 'middle-aged':
        // Standard adult voices - neutral scoring
        return 1

      default:
        return 0
    }
  }

  /**
   * Generate human-readable reasoning for the age-based score.
   *
   * @param voice The voice being evaluated
   * @param character The character traits
   * @returns Explanation of why this score was given
   */
  getReasoning(voice: Voice, character: CharacterTraits): string {
    if (!character.age) {
      return 'No age information available'
    }

    const voiceName = voice.name.toLowerCase()
    const age = character.age

    switch (age) {
      case 'child':
        return voiceName.includes('young') || voiceName.includes('bella')
          ? `${voice.name} has a youthful tone suitable for children`
          : `${voice.name} may not be ideal for child characters`

      case 'elderly':
        return voiceName.includes('old') || voiceName.includes('deep')
          ? `${voice.name} has a mature tone suitable for elderly characters`
          : `${voice.name} may not be ideal for elderly characters`

      case 'teen':
        return voiceName.includes('young')
          ? `${voice.name} has a youthful tone suitable for teenagers`
          : `${voice.name} has a standard tone for teenagers`

      default:
        return `${voice.name} is suitable for ${age} characters`
    }
  }
}