/**
 * @fileoverview Narrator voice scoring strategy.
 *
 * ## Architecture Context
 * This strategy implements story-appropriate narrator voice matching as part
 * of the Strategy Pattern for voice assignment. It analyzes story characteristics
 * to recommend narrator voices that enhance the storytelling experience.
 *
 * ## Information Flow
 * 1. Receives a voice and story analysis from the VoiceAssignmentService
 * 2. Analyzes story tone, genre, and length against voice characteristics
 * 3. Returns a score indicating narrator match quality
 * 4. Provides human-readable reasoning for the score
 *
 * ## Contract Compliance
 * - Implements the `NarratorScoringStrategy` interface from contracts
 * - Pure function approach with no side effects
 * - Deterministic scoring based on story analysis and voice patterns
 */

import { Injectable } from '@angular/core'
import { NarratorScoringStrategy, Voice, StoryAnalysis } from '../../../shared/contracts'

@Injectable({ providedIn: 'root' })
export class StoryNarratorScoringStrategy implements NarratorScoringStrategy {
  /**
   * Score how well a voice matches a story's narrator requirements.
   *
   * Scoring Rules:
   * - Formal tone: +1 for 'formal' or 'professional' voices
   * - Casual tone: +1 for 'casual' or 'friendly' voices
   * - Dramatic tone: +1 for 'dramatic' or 'deep' voices
   * - Whimsical tone: +1 for 'whimsical' or 'light' voices
   * - Long stories: +1 for 'calm' voices (better for sustained listening)
   * - Short stories: +1 for 'engaging' voices (better for quick attention)
   *
   * @param voice The voice to score
   * @param storyAnalysis The story characteristics to match against
   * @returns Score from 0-1 indicating narrator match quality
   */
  score(voice: Voice, storyAnalysis: StoryAnalysis): number {
    const voiceName = voice.name.toLowerCase()
    let score = 0

    // Tone matching (primary factor)
    switch (storyAnalysis.tone) {
      case 'formal':
        if (voiceName.includes('formal') || voiceName.includes('professional')) {
          score += 1
        }
        break

      case 'casual':
        if (voiceName.includes('casual') || voiceName.includes('friendly')) {
          score += 1
        }
        break

      case 'dramatic':
        if (voiceName.includes('dramatic') || voiceName.includes('deep')) {
          score += 1
        }
        break

      case 'whimsical':
        if (voiceName.includes('whimsical') || voiceName.includes('light')) {
          score += 1
        }
        break
    }

    // Length consideration (secondary factor)
    if (storyAnalysis.length === 'long' && voiceName.includes('calm')) {
      score += 0.5
    } else if (storyAnalysis.length === 'short' && voiceName.includes('engaging')) {
      score += 0.5
    }

    // Genre consideration (tertiary factor)
    if (storyAnalysis.genre.includes('horror') && voiceName.includes('mysterious')) {
      score += 0.3
    } else if (storyAnalysis.genre.includes('romance') && voiceName.includes('warm')) {
      score += 0.3
    }

    return Math.min(score, 1) // Cap at 1.0
  }

  /**
   * Generate human-readable reasoning for the narrator-based score.
   *
   * @param voice The voice being evaluated
   * @param storyAnalysis The story characteristics
   * @returns Explanation of why this score was given
   */
  getReasoning(voice: Voice, storyAnalysis: StoryAnalysis): string {
    const voiceName = voice.name.toLowerCase()
    const reasons: string[] = []

    // Primary tone reasoning
    switch (storyAnalysis.tone) {
      case 'formal':
        if (voiceName.includes('formal') || voiceName.includes('professional')) {
          reasons.push('formal tone matches the story\'s formal style')
        }
        break

      case 'casual':
        if (voiceName.includes('casual') || voiceName.includes('friendly')) {
          reasons.push('casual tone matches the story\'s casual style')
        }
        break

      case 'dramatic':
        if (voiceName.includes('dramatic') || voiceName.includes('deep')) {
          reasons.push('dramatic tone enhances the story\'s dramatic elements')
        }
        break

      case 'whimsical':
        if (voiceName.includes('whimsical') || voiceName.includes('light')) {
          reasons.push('whimsical tone complements the story\'s playful nature')
        }
        break
    }

    // Length reasoning
    if (storyAnalysis.length === 'long' && voiceName.includes('calm')) {
      reasons.push('calm delivery is ideal for longer stories')
    } else if (storyAnalysis.length === 'short' && voiceName.includes('engaging')) {
      reasons.push('engaging delivery suits shorter stories')
    }

    // Genre reasoning
    if (storyAnalysis.genre.includes('horror') && voiceName.includes('mysterious')) {
      reasons.push('mysterious tone enhances horror elements')
    } else if (storyAnalysis.genre.includes('romance') && voiceName.includes('warm')) {
      reasons.push('warm tone complements romantic themes')
    }

    if (reasons.length === 0) {
      return `${voice.name} is a suitable narrator voice for this story`
    }

    return `${voice.name} is recommended because it has a ${reasons.join(' and ')}`
  }
}