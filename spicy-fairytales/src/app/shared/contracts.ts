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

export interface AudioChunk {
  audio: ArrayBuffer
  text?: string
  timestamp: number
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
  synthesize(story: ParsedStory, assignments?: VoiceAssignment[]): Observable<AudioChunk>
  listVoices?(): Promise<{ id: string; name: string }[]>
}
