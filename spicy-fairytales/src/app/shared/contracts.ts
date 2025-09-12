/**
 * Core data contracts and service interfaces defining the application's architectural boundaries.
 * 
 * This file serves as the single source of truth for all data structures flowing through the
 * story generation pipeline: StoryOptions → StoryService → Raw Story → SpeakerParser → 
 * ParsedStory → VoiceService → AudioChunks.
 * 
 * INPUT: StoryOptions (user preferences), Raw story text
 * OUTPUT: ParsedStory (structured segments), AudioChunk (synthesized audio)
 * DEPENDENCIES: RxJS Observable for reactive data flow
 * INTEGRATIONS: All services must implement these interfaces to ensure type safety and
 * consistent data flow across the pipeline. UI components depend only on these contracts,
 * never on concrete service implementations.
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
