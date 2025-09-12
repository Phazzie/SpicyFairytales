/**
 * @fileoverview Gender-based voice scoring strategy.
 *
 * ## Architecture Context
 * This strategy implements gender-appropriate voice matching as part of the
 * Strategy Pattern for voice assignment. It ensures voices align with character
 * gender expectations while remaining flexible for creative choices.
 *
 * ## Information Flow
 * 1. Receives a voice and character traits from the VoiceAssignmentService
 * 2. Analyzes the character's gender against voice name patterns
 * 3. Returns a score indicating gender match quality
 * 4. Provides human-readable reasoning for the score
 *
 * ## Contract Compliance
 * - Implements the `VoiceScoringStrategy` interface from contracts
 * - Pure function approach with no side effects
 * - Deterministic scoring based on character gender and voice patterns
 */

import { Injectable } from '@angular/core'
import { VoiceScoringStrategy, Voice, CharacterTraits } from '../../../shared/contracts'

@Injectable({ providedIn: 'root' })
export class GenderScoringStrategy implements VoiceScoringStrategy {
  /**
   * Score how well a voice matches a character's gender.
   *
   * Scoring Rules:
   * - Male characters: +2 for voices with 'male' in name
   * - Female characters: +2 for voices with 'female' in name
   * - Neutral gender: +1 for any voice (flexible casting)
   * - No gender specified: 0 points (neutral)
   *
   * @param voice The voice to score
   * @param character The character traits to match against
   * @returns Score from 0-2 indicating gender match quality
   */
  score(voice: Voice, character: CharacterTraits): number {
    if (!character.gender) {
      return 0 // No gender information available
    }

    const voiceName = voice.name.toLowerCase()

    switch (character.gender) {
      case 'male':
        // Male characters should have male-sounding voices
        return voiceName.includes('male') || voiceName.includes('deep') ? 2 : 0

      case 'female':
        // Female characters should have female-sounding voices
        return voiceName.includes('female') || voiceName.includes('bella') ? 2 : 0

      case 'neutral':
        // Neutral characters can use any voice
        return 1

      default:
        return 0
    }
  }

  /**
   * Generate human-readable reasoning for the gender-based score.
   *
   * @param voice The voice being evaluated
   * @param character The character traits
   * @returns Explanation of why this score was given
   */
  getReasoning(voice: Voice, character: CharacterTraits): string {
    if (!character.gender) {
      return 'No gender information available'
    }

    const voiceName = voice.name.toLowerCase()
    const gender = character.gender

    switch (gender) {
      case 'male':
        return voiceName.includes('male') || voiceName.includes('deep')
          ? `${voice.name} has a masculine tone suitable for male characters`
          : `${voice.name} may not be ideal for male characters`

      case 'female':
        return voiceName.includes('female') || voiceName.includes('bella')
          ? `${voice.name} has a feminine tone suitable for female characters`
          : `${voice.name} may not be ideal for female characters`

      case 'neutral':
        return `${voice.name} works well for gender-neutral characters`

      default:
        return `${voice.name} is suitable for ${gender} characters`
    }
  }
}