/**
 * @fileoverview Role-based voice scoring strategy.
 *
 * ## Architecture Context
 * This strategy implements role-appropriate voice matching as part of the
 * Strategy Pattern for voice assignment. It matches character roles with
 * voice characteristics that enhance storytelling (e.g., confident heroes,
 * menacing villains).
 *
 * ## Information Flow
 * 1. Receives a voice and character traits from the VoiceAssignmentService
 * 2. Analyzes the character's role against voice name patterns
 * 3. Returns a score indicating role match quality
 * 4. Provides human-readable reasoning for the score
 *
 * ## Contract Compliance
 * - Implements the `VoiceScoringStrategy` interface from contracts
 * - Pure function approach with no side effects
 * - Deterministic scoring based on character role and voice patterns
 */

import { Injectable } from '@angular/core'
import { VoiceScoringStrategy, Voice, CharacterTraits } from '../../../shared/contracts'

@Injectable({ providedIn: 'root' })
export class RoleScoringStrategy implements VoiceScoringStrategy {
  /**
   * Score how well a voice matches a character's role.
   *
   * Scoring Rules:
   * - Protagonist/Hero: +1 for 'confident' voices
   * - Antagonist/Villain: +1 for 'deep' voices
   * - Mentor: +1 for 'wise' or 'calm' voices
   * - Sidekick: +1 for 'friendly' voices
   * - Neutral: 0 points (no role preference)
   *
   * @param voice The voice to score
   * @param character The character traits to match against
   * @returns Score from 0-1 indicating role match quality
   */
  score(voice: Voice, character: CharacterTraits): number {
    if (!character.role) {
      return 0 // No role information available
    }

    const voiceName = voice.name.toLowerCase()

    switch (character.role) {
      case 'protagonist':
        // Heroes should sound confident and determined
        return voiceName.includes('confident') || voiceName.includes('strong') ? 1 : 0

      case 'antagonist':
      case 'villain':
        // Villains should sound deep and menacing
        return voiceName.includes('deep') || voiceName.includes('dark') ? 1 : 0

      case 'mentor':
        // Mentors should sound wise and calm
        return voiceName.includes('wise') || voiceName.includes('calm') ? 1 : 0

      case 'sidekick':
        // Sidekicks should sound friendly and approachable
        return voiceName.includes('friendly') || voiceName.includes('warm') ? 1 : 0

      case 'neutral':
      default:
        // Neutral roles have no specific voice preferences
        return 0
    }
  }

  /**
   * Generate human-readable reasoning for the role-based score.
   *
   * @param voice The voice being evaluated
   * @param character The character traits
   * @returns Explanation of why this score was given
   */
  getReasoning(voice: Voice, character: CharacterTraits): string {
    if (!character.role) {
      return 'No role information available'
    }

    const voiceName = voice.name.toLowerCase()
    const role = character.role

    switch (role) {
      case 'protagonist':
        return voiceName.includes('confident') || voiceName.includes('strong')
          ? `${voice.name} has a confident tone suitable for protagonists`
          : `${voice.name} is acceptable for ${role} characters`

      case 'antagonist':
      case 'villain':
        return voiceName.includes('deep') || voiceName.includes('dark')
          ? `${voice.name} has a deep tone suitable for villains`
          : `${voice.name} is acceptable for ${role} characters`

      case 'mentor':
        return voiceName.includes('wise') || voiceName.includes('calm')
          ? `${voice.name} has a wise tone suitable for mentors`
          : `${voice.name} is acceptable for ${role} characters`

      case 'sidekick':
        return voiceName.includes('friendly') || voiceName.includes('warm')
          ? `${voice.name} has a friendly tone suitable for sidekicks`
          : `${voice.name} is acceptable for ${role} characters`

      default:
        return `${voice.name} is suitable for ${role} characters`
    }
  }
}