/**
 * Shared contracts for service seams used across the Angular app.
 */
import { Observable } from 'rxjs'
export interface StoryOptions {
  title?: string
  genre: string
  tone: string
  length: 'short' | 'medium' | 'long'
  themes?: string[]
  prompt?: string
  // New fields for enhanced story generation
  characterType?: 'werewolf' | 'vampire' | 'faerie'
  userIdeas?: string
  spicyLevel?: number // 1-10 scale
  selectedThemes?: string[]
}

export interface ParsedStorySegment {
  type: 'narration' | 'dialogue' | 'action'
  text: string
  character?: string
  emotion?: string
  ssml?: string
}

export interface ParsedStory {
  segments: ParsedStorySegment[]
  characters: { name: string; appearances: number }[]
}

export interface VoiceAssignment {
  character: string
  voiceId: string
}

export interface NarratorVoiceAssignment {
  voiceId: string
  name?: string
}

export interface VoiceRecommendation {
  character: string
  recommendedVoiceId: string
  confidence: number
  reasoning?: string
  alternatives?: { voiceId: string; reasoning: string }[]
}

// Character traits for voice scoring
export interface CharacterTraits {
  name: string
  age?: 'child' | 'teen' | 'young-adult' | 'adult' | 'middle-aged' | 'elderly'
  gender?: 'male' | 'female' | 'neutral'
  personality?: string[]
  role?: 'protagonist' | 'antagonist' | 'sidekick' | 'mentor' | 'villain' | 'neutral'
  description?: string
  emotionalRange?: string[]
  context?: string
}

// Voice Scoring Strategy Contracts
export interface VoiceScoringStrategy {
  score(voice: Voice, character: CharacterTraits): number
  getReasoning(voice: Voice, character: CharacterTraits): string
}

export interface NarratorScoringStrategy {
  score(voice: Voice, storyAnalysis: StoryAnalysis): number
  getReasoning(voice: Voice, storyAnalysis: StoryAnalysis): string
}

export interface StoryAnalysis {
  tone: 'formal' | 'casual' | 'dramatic' | 'whimsical'
  genre: string[]
  length: 'short' | 'medium' | 'long'
  wordCount: number
}

// Voice interface for strategies
export interface Voice {
  id: string
  name: string
}

export interface AudioChunk {
  audio: ArrayBuffer
  text?: string
  timestamp: number
  segmentType?: 'narration' | 'dialogue' | 'action'
  character?: string
}

// Service contracts
export interface StoryService {
  // Emits chunks of story text as they stream in
  generateStory(options: StoryOptions): Observable<string>
}

export interface SpeakerParser {
  parseStory(text: string): Promise<ParsedStory>
}

export interface VoiceService {
  synthesize(story: ParsedStory, assignments?: VoiceAssignment[], narratorVoice?: NarratorVoiceAssignment): Observable<AudioChunk>
  listVoices?(): Promise<{ id: string; name: string }[]>
}
