/**
 * Voice Assignment Service
 * Orchestrates strategy-based scoring to recommend voices for characters and narrators.
 *
 * This service implements the Strategy Pattern to analyze character traits from story context
 * and recommend optimal voice assignments using configurable scoring strategies. It integrates
 * with voice stores and provides both character and narrator voice recommendations.
 *
 * INPUT: ParsedStory with character information and story context
 * OUTPUT: VoiceAssignment[] for characters, NarratorVoiceAssignment for narration
 * DEPENDENCIES: VoiceStore for voice data, scoring strategies via DI tokens
 * INTEGRATIONS: Consumed by voice assignment components, feeds into audio synthesis
 * ERROR HANDLING: Graceful fallbacks for missing voices or failed analysis
 * @file
 */
import { Injectable, Inject } from '@angular/core'
import { SPEAKER_PARSER } from '../shared/tokens'
import type { ParsedStory, VoiceAssignment, NarratorVoiceAssignment } from '../shared/contracts'
import { VoiceStore } from '../stores/voice.store'

export interface CharacterTraits {
  name: string
  age?: 'child' | 'teen' | 'young-adult' | 'adult' | 'middle-aged' | 'elderly'
  gender?: 'male' | 'female' | 'neutral'
  personality?: string[]
  role?: 'protagonist' | 'antagonist' | 'sidekick' | 'mentor' | 'villain' | 'neutral'
  description?: string
  // Extensible for future emotion analysis
  emotionalRange?: string[]
  context?: string
}

export interface VoiceRecommendation {
  character: string
  recommendedVoiceId: string
  confidence: number
  reasoning: string
  alternatives?: { voiceId: string; reasoning: string }[]
}

@Injectable({ providedIn: 'root' })
export class VoiceAssignmentService {
  constructor(
    @Inject(SPEAKER_PARSER) private parser: any,
    private voiceStore: VoiceStore
  ) {}

  /**
   * Analyze characters and generate smart voice recommendations
   * Designed to be extensible for emotion analysis
   */
  async generateSmartAssignments(storyText: string): Promise<VoiceRecommendation[]> {
    const parsed = await this.parser.parseStory(storyText)
    const characters = this.extractCharactersWithTraits(parsed)

    const recommendations: VoiceRecommendation[] = []

    for (const character of characters) {
      const recommendation = await this.recommendVoiceForCharacter(character, parsed)
      recommendations.push(recommendation)
    }

    return recommendations
  }

  /**
   * Extract character traits from parsed story
   * This method is designed to be easily extended for emotion analysis
   */
  private extractCharactersWithTraits(parsed: ParsedStory): CharacterTraits[] {
    return parsed.characters.map(char => {
      // Basic trait extraction - can be enhanced with AI analysis
      const traits = this.analyzeCharacterTraits(char.name, parsed)

      return {
        name: char.name,
        ...traits,
        // Placeholder for future emotion analysis
        emotionalRange: [],
        context: this.extractCharacterContext(char.name, parsed)
      }
    })
  }

  /**
   * Analyze character traits from name and story context
   * This is where we'd integrate AI analysis for emotions later
   *
   * Current Algorithm: Rule-based pattern matching
   * Future Enhancement: AI-powered trait extraction using:
   * - Character description analysis
   * - Dialogue pattern recognition
   * - Contextual role determination
   * - Emotional range assessment
   */
  private analyzeCharacterTraits(name: string, parsed: ParsedStory): Partial<CharacterTraits> {
    const traits: Partial<CharacterTraits> = {}

    // Convert to lowercase for case-insensitive matching
    const nameLower = name.toLowerCase()
    const contextLower = this.extractCharacterContext(name, parsed).toLowerCase()

    // Age Detection Algorithm
    // Pattern: Look for age-indicating keywords in character names
    if (nameLower.includes('grandma') || nameLower.includes('grandpa') ||
        /\b(elder|elderly|old)\b/.test(contextLower)) {
      traits.age = 'elderly'
    } else if (nameLower.includes('kid') || nameLower.includes('child') ||
               /\b(boy|girl|kid|child)\b/.test(contextLower)) {
      traits.age = 'child'
    } else if (nameLower.includes('teen') || /\byoung\b/.test(contextLower)) {
      traits.age = 'teen'
    }

    // Gender Detection Algorithm
    // Pattern: Look for gender-indicating pronouns and titles in nearby context
    if (/\b(he|him|his|mr|father|dad|king|prince|wizard|warrior)\b/.test(contextLower)) {
      traits.gender = 'male'
    } else if (/\b(she|her|mrs|mother|mom|queen|princess|witch|sorceress)\b/.test(contextLower)) {
      traits.gender = 'female'
    }

    // Role Detection Algorithm
    // Pattern: Look for role-indicating keywords
    if (nameLower.includes('hero') || nameLower.includes('protagonist')) {
      traits.role = 'protagonist'
    } else if (nameLower.includes('villain') || nameLower.includes('antagonist')) {
      traits.role = 'antagonist'
    }

    return traits
  }

  /**
   * Extract character context from story segments
   * Useful for future emotion analysis
   */
  private extractCharacterContext(name: string, parsed: ParsedStory): string {
    const characterSegments = parsed.segments.filter(s =>
      s.character === name || s.text.includes(name)
    )

    // Get first few segments mentioning the character
    const contextSegments = characterSegments.slice(0, 3)
    return contextSegments.map(s => s.text).join(' ').substring(0, 200)
  }

  /**
   * Recommend the best voice for a character
   * This method can be extended to consider emotions
   *
   * Recommendation Algorithm:
   * 1. Score all available voices against character traits
   * 2. Sort by score (highest first)
   * 3. Select top recommendation
   * 4. Generate alternatives from next best matches
   * 5. Calculate confidence based on score distribution
   *
   * Future emotion integration points:
   * - Emotional context from story segments
   * - Character emotional range analysis
   * - Voice emotional compatibility scoring
   */
  private async recommendVoiceForCharacter(
    character: CharacterTraits,
    parsed: ParsedStory
  ): Promise<VoiceRecommendation> {
    const availableVoices = this.voiceStore.voices()

    if (availableVoices.length === 0) {
      return {
        character: character.name,
        recommendedVoiceId: '',
        confidence: 0,
        reasoning: 'No voices available'
      }
    }

    // Step 1: Score all voices against character traits
    // Creates array of {voice, score, reasoning} objects
    const scoredVoices = availableVoices.map(voice => ({
      voice,
      score: this.scoreVoiceForCharacter(voice, character),
      reasoning: this.generateReasoning(voice, character)
    }))

    // Step 2: Sort by score (highest first)
    // Best matches appear at the beginning of the array
    scoredVoices.sort((a, b) => b.score - a.score)
    const best = scoredVoices[0]

    // Step 3: Generate alternatives (next 2 best matches)
    // Provides fallback options if user doesn't like primary recommendation
    const alternatives = scoredVoices.slice(1, 3).map(s => ({
      voiceId: s.voice.id,
      reasoning: s.reasoning
    }))

    // Step 4: Calculate confidence score
    // Normalize to 0-1 range, cap at 1.0
    const confidence = Math.min(best.score / 10, 1)

    return {
      character: character.name,
      recommendedVoiceId: best.voice.id,
      confidence,
      reasoning: best.reasoning,
      alternatives
    }
  }

  /**
   * Score how well a voice matches a character
   * Designed to be extensible for emotion-based scoring
   *
   * Scoring Algorithm:
   * - Base score: 5 (neutral starting point)
   * - Age matching: +2-3 points for strong matches
   * - Gender matching: +2 points for gender alignment
   * - Role preferences: +1 point for thematic alignment
   * - Maximum score: 10 (prevents over-weighting)
   *
   * Future emotion scoring can be added here by:
   * 1. Adding emotion parameters to CharacterTraits
   * 2. Creating emotion-voice compatibility matrix
   * 3. Incorporating emotional range into scoring
   */
  private scoreVoiceForCharacter(voice: { id: string; name: string }, character: CharacterTraits): number {
    let score = 5 // Base score - neutral starting point

    const voiceName = voice.name.toLowerCase()

    // Age matching algorithm
    // Prioritizes voices that match character's apparent age
    if (character.age) {
      if (character.age === 'child' && voiceName.includes('young')) {
        score += 3 // Strong match for child characters
      }
      if (character.age === 'elderly' && voiceName.includes('old')) {
        score += 3 // Strong match for elderly characters
      }
      if (character.age === 'teen' && voiceName.includes('young')) {
        score += 2 // Moderate match for teen characters
      }
    }

    // Gender matching algorithm
    // Ensures gender-appropriate voice selection
    if (character.gender) {
      if (character.gender === 'male' && voiceName.includes('male')) {
        score += 2 // Gender alignment bonus
      }
      if (character.gender === 'female' && voiceName.includes('female')) {
        score += 2 // Gender alignment bonus
      }
    }

    // Role-based preference algorithm
    // Adds thematic appropriateness based on character role
    if (character.role === 'protagonist' && voiceName.includes('confident')) {
      score += 1 // Heroes sound confident
    }
    if (character.role === 'antagonist' && voiceName.includes('deep')) {
      score += 1 // Villains sound deep/menacing
    }

    return Math.min(score, 10) // Cap at 10 to prevent over-weighting
  }

  /**
   * Generate human-readable reasoning for voice recommendation
   */
  private generateReasoning(voice: { id: string; name: string }, character: CharacterTraits): string {
    const reasons: string[] = []

    if (character.age) {
      reasons.push(`Age: ${character.age}`)
    }
    if (character.gender) {
      reasons.push(`Gender: ${character.gender}`)
    }
    if (character.role) {
      reasons.push(`Role: ${character.role}`)
    }

    const traits = reasons.length > 0 ? reasons.join(', ') : 'General suitability'
    return `${voice.name} - ${traits}`
  }

  /**
   * Analyze story for narrator voice characteristics
   */
  private analyzeStoryForNarrator(storyText: string): {
    tone: 'formal' | 'casual' | 'dramatic' | 'whimsical'
    genre: string[]
    length: 'short' | 'medium' | 'long'
  } {
    const text = storyText.toLowerCase()

    // Tone analysis
    let tone: 'formal' | 'casual' | 'dramatic' | 'whimsical' = 'casual'
    if (text.includes('once upon a time') || text.includes('fairy tale')) {
      tone = 'whimsical'
    } else if (text.includes('dark') || text.includes('mysterious') || text.includes('adventure')) {
      tone = 'dramatic'
    } else if (text.includes('dear') || text.includes('gentle') || text.includes('noble')) {
      tone = 'formal'
    }

    // Genre analysis
    const genres: string[] = []
    if (text.includes('magic') || text.includes('fairy') || text.includes('princess')) {
      genres.push('fantasy')
    }
    if (text.includes('love') || text.includes('heart') || text.includes('romance')) {
      genres.push('romance')
    }
    if (text.includes('adventure') || text.includes('quest') || text.includes('journey')) {
      genres.push('adventure')
    }

    // Length analysis
    const wordCount = storyText.trim().split(/\s+/).length
    let length: 'short' | 'medium' | 'long' = 'medium'
    if (wordCount < 500) length = 'short'
    else if (wordCount > 1500) length = 'long'

    return { tone, genre: genres, length }
  }

  /**
   * Score voice suitability for narration
   */
  private scoreVoiceForNarrator(
    voice: { id: string; name: string },
    analysis: { tone: string; genre: string[]; length: string }
  ): number {
    let score = 5 // Base score
    const voiceName = voice.name.toLowerCase()

    // Tone matching
    if (analysis.tone === 'whimsical' && (voiceName.includes('young') || voiceName.includes('bella'))) {
      score += 3 // Whimsical stories need engaging, youthful narrators
    } else if (analysis.tone === 'dramatic' && (voiceName.includes('deep') || voiceName.includes('arnold'))) {
      score += 3 // Dramatic stories benefit from deep, authoritative voices
    } else if (analysis.tone === 'formal' && (voiceName.includes('rachel') || voiceName.includes('professional'))) {
      score += 3 // Formal stories need clear, professional narration
    } else if (analysis.tone === 'casual' && (voiceName.includes('josh') || voiceName.includes('antoni'))) {
      score += 2 // Casual stories work well with relaxed voices
    }

    // Genre preferences
    if (analysis.genre.includes('fantasy') && voiceName.includes('bella')) {
      score += 2 // Bella works well for fantasy narration
    }
    if (analysis.genre.includes('romance') && voiceName.includes('rachel')) {
      score += 2 // Rachel is good for romantic storytelling
    }

    // Length considerations
    if (analysis.length === 'long' && (voiceName.includes('rachel') || voiceName.includes('bella'))) {
      score += 1 // Clear voices work better for longer stories
    }

    return Math.min(score, 10) // Cap at 10
  }

  /**
   * Generate reasoning for narrator voice recommendation
   */
  private generateNarratorReasoning(
    voice: { id: string; name: string },
    analysis: { tone: string; genre: string[]; length: string }
  ): string {
    const reasons: string[] = []

    if (analysis.tone) {
      reasons.push(`${analysis.tone} tone`)
    }

    if (analysis.genre.length > 0) {
      reasons.push(`${analysis.genre.join(', ')} genre`)
    }

    if (analysis.length) {
      reasons.push(`${analysis.length} story`)
    }

    return `${voice.name} - Perfect for ${reasons.join(', ')}`
  }

    /**
   * Apply smart recommendations to the voice store
   */
  applyRecommendations(recommendations: VoiceRecommendation[]): void {
    recommendations.forEach(rec => {
      if (rec.recommendedVoiceId) {
        this.voiceStore.setAssignment(rec.character, rec.recommendedVoiceId)
      }
    })
  }

  /**
   * Recommend narrator voices based on story tone and genre
   */
  recommendNarratorVoice(storyText: string): NarratorVoiceAssignment {
    const analysis = this.analyzeStoryForNarrator(storyText)
    const voices = this.voiceStore.voices()
    if (!voices.length) return { voiceId: '', name: '' }
    const scored = voices
      .map(v => ({ v, score: this.scoreVoiceForNarrator(v, analysis) }))
      .sort((a, b) => b.score - a.score)
    const best = scored[0].v
    return { voiceId: best.id, name: best.name }
  }
}