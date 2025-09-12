import { Injectable, Inject } from '@angular/core'
import { Observable, from } from 'rxjs'
import { SPEAKER_PARSER } from '../shared/tokens'
import type {
  ParsedStory,
  VoiceAssignment,
  NarratorVoiceAssignment,
  VoiceScoringStrategy,
  NarratorScoringStrategy,
  Voice,
  StoryAnalysis
} from '../shared/contracts'
import { VoiceStore } from '../stores/voice.store'
import {
  AGE_SCORING_STRATEGY,
  GENDER_SCORING_STRATEGY,
  ROLE_SCORING_STRATEGY,
  NARRATOR_SCORING_STRATEGY
} from '../shared/tokens'

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
    private voiceStore: VoiceStore,
    @Inject(AGE_SCORING_STRATEGY) private ageStrategy: VoiceScoringStrategy,
    @Inject(GENDER_SCORING_STRATEGY) private genderStrategy: VoiceScoringStrategy,
    @Inject(ROLE_SCORING_STRATEGY) private roleStrategy: VoiceScoringStrategy,
    @Inject(NARRATOR_SCORING_STRATEGY) private narratorStrategy: NarratorScoringStrategy
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

    // Age Detection Algorithm
    // Pattern: Look for age-indicating keywords in character names
    if (nameLower.includes('grandma') || nameLower.includes('grandpa') ||
        nameLower.includes('elder') || nameLower.includes('old')) {
      traits.age = 'elderly'
    } else if (nameLower.includes('kid') || nameLower.includes('child') ||
               nameLower.includes('boy') || nameLower.includes('girl')) {
      traits.age = 'child'
    } else if (nameLower.includes('teen') || nameLower.includes('young')) {
      traits.age = 'teen'
    }

    // Gender Detection Algorithm
    // Pattern: Look for gender-indicating pronouns and titles
    if (nameLower.includes('he ') || nameLower.includes('him ') ||
        nameLower.includes('his ') || nameLower.match(/\b(mr|father|dad|king|prince|wizard|warrior)\b/)) {
      traits.gender = 'male'
    } else if (nameLower.includes('she ') || nameLower.includes('her ') ||
               nameLower.match(/\b(mrs|mother|mom|queen|princess|witch|sorceress)\b/)) {
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
   * Score how well a voice matches a character using Strategy Pattern
   *
   * ## Architecture Benefits
   * - Separates scoring concerns into focused strategies
   * - Reduces cyclomatic complexity from ~20 to ~5
   * - Enables easy testing and extension of individual strategies
   * - Maintains clean separation of business logic
   *
   * ## Scoring Algorithm
   * Combines multiple strategy scores with weighted approach:
   * - Age matching: 40% weight (most important for character authenticity)
   * - Gender matching: 30% weight (important for character representation)
   * - Role matching: 30% weight (important for thematic consistency)
   *
   * @param voice The voice to evaluate
   * @param character The character traits to match against
   * @returns Composite score from 0-10 based on all applicable strategies
   */
  private scoreVoiceForCharacter(voice: Voice, character: CharacterTraits): number {
    let totalScore = 0
    let totalWeight = 0

    // Age scoring (40% weight)
    if (character.age) {
      const ageScore = this.ageStrategy.score(voice, character)
      totalScore += ageScore * 4 // 40% weight
      totalWeight += 4
    }

    // Gender scoring (30% weight)
    if (character.gender) {
      const genderScore = this.genderStrategy.score(voice, character)
      totalScore += genderScore * 3 // 30% weight
      totalWeight += 3
    }

    // Role scoring (30% weight)
    if (character.role) {
      const roleScore = this.roleStrategy.score(voice, character)
      totalScore += roleScore * 3 // 30% weight
      totalWeight += 3
    }

    // If no traits available, return neutral score
    if (totalWeight === 0) {
      return 5
    }

    // Normalize to 0-10 range and scale to match original algorithm expectations
    const normalizedScore = (totalScore / totalWeight) * 10
    return Math.min(normalizedScore, 10)
  }

  /**
   * Generate comprehensive reasoning using Strategy Pattern
   *
   * ## Architecture Benefits
   * - Combines reasoning from multiple focused strategies
   * - Provides detailed, human-readable explanations
   * - Maintains separation of reasoning logic
   *
   * @param voice The voice being evaluated
   * @param character The character traits
   * @returns Combined reasoning from all applicable strategies
   */
  private generateReasoning(voice: Voice, character: CharacterTraits): string {
    const reasons: string[] = []

    // Collect reasoning from each applicable strategy
    if (character.age) {
      reasons.push(this.ageStrategy.getReasoning(voice, character))
    }

    if (character.gender) {
      reasons.push(this.genderStrategy.getReasoning(voice, character))
    }

    if (character.role) {
      reasons.push(this.roleStrategy.getReasoning(voice, character))
    }

    // If no specific traits, provide general reasoning
    if (reasons.length === 0) {
      return `${voice.name} is suitable for general character roles`
    }

    return reasons.join('. ')
  }

  /**
   * Analyze story for narrator voice selection using Strategy Pattern
   *
   * ## Architecture Benefits
   * - Provides structured story analysis for narrator strategy
   * - Separates analysis logic from scoring logic
   * - Enables easy testing of story analysis
   * - Returns proper StoryAnalysis contract
   *
   * @param storyText The full story text to analyze
   * @returns Structured analysis of story characteristics
   */
  private analyzeStoryForNarrator(storyText: string): StoryAnalysis {
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
    const wordCount = storyText.split(' ').length
    let length: 'short' | 'medium' | 'long' = 'medium'
    if (wordCount < 500) length = 'short'
    else if (wordCount > 1500) length = 'long'

    return {
      tone,
      genre: genres,
      length,
      wordCount
    }
  }

  /**
   * Score voice suitability for narration using Strategy Pattern
   *
   * ## Architecture Benefits
   * - Delegates narrator scoring to specialized strategy
   * - Reduces complexity in main service
   * - Enables easy testing of narrator logic
   * - Maintains clean separation of concerns
   *
   * @param voice The voice to evaluate for narration
   * @param analysis The story analysis containing tone, genre, and length
   * @returns Score from 0-10 indicating narrator suitability
   */
  private scoreVoiceForNarrator(voice: Voice, analysis: StoryAnalysis): number {
    // Use the narrator strategy to score the voice
    const strategyScore = this.narratorStrategy.score(voice, analysis)

    // Scale to match original 0-10 range
    return strategyScore * 10
  }

  /**
   * Generate reasoning for narrator voice recommendation using Strategy Pattern
   *
   * ## Architecture Benefits
   * - Delegates reasoning generation to specialized strategy
   * - Provides detailed, context-aware explanations
   * - Maintains separation of narrator reasoning logic
   *
   * @param voice The voice being evaluated
   * @param analysis The story analysis
   * @returns Human-readable reasoning for narrator suitability
   */
  private generateNarratorReasoning(voice: Voice, analysis: StoryAnalysis): string {
    return this.narratorStrategy.getReasoning(voice, analysis)
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
    // Analyze story for tone indicators
    const storyLower = storyText.toLowerCase()

    // Professional voices for serious/fantasy stories
    const professionalVoices = [
      { voiceId: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', reasoning: 'Clear, professional tone perfect for narration' },
      { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', reasoning: 'Warm, engaging voice for storytelling' },
      { voiceId: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', reasoning: 'Confident, authoritative presence' }
    ]

    // Warm voices for lighter stories
    const warmVoices = [
      { voiceId: 'ErXwobaYiN019PkySvjV', name: 'Antoni', reasoning: 'Warm, friendly tone for engaging narration' },
      { voiceId: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', reasoning: 'Relaxed, conversational style' }
    ]

    // Choose based on story content
    let selectedVoice: { voiceId: string; name: string; reasoning: string }
    if (storyLower.includes('dark') || storyLower.includes('mysterious') ||
        storyLower.includes('ancient') || storyLower.includes('forbidden')) {
      selectedVoice = professionalVoices[0] // Rachel for serious tones
    } else if (storyLower.includes('adventure') || storyLower.includes('quest') ||
               storyLower.includes('hero') || storyLower.includes('journey')) {
      selectedVoice = professionalVoices[1] // Bella for adventurous tales
    } else {
      selectedVoice = warmVoices[0] // Antoni for general storytelling
    }

    return {
      voiceId: selectedVoice.voiceId,
      name: selectedVoice.name
    }
  }
}