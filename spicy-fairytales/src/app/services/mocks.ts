/**
 * Mock service implementations enabling cost-free development and testing of the story generation pipeline.
 * 
 * Complete mock implementations of all core services (StoryService, SpeakerParser, VoiceService)
 * that simulate real API behavior without external costs. Enables the mock-first development
 * workflow by providing realistic data and timing patterns for UI development and testing.
 * 
 * INPUT: Same interfaces as real services - StoryOptions, story text, voice assignments
 * OUTPUT: Simulated API responses with realistic timing, sample data, and error conditions
 * DEPENDENCIES: RxJS for reactive streams, contracts for interface compliance
 * INTEGRATIONS: Drop-in replacements for real services, controlled by environment configuration
 * BENEFITS: Zero API costs during development, predictable test data, offline development capability
 * ARCHITECTURE: Maintains exact interface compliance with real services for seamless switching
 */
import { Observable, concat, of, timer, map } from 'rxjs'
import type {
  AudioChunk,
  ParsedStory,
  SpeakerParser,
  StoryOptions,
  StoryService,
  VoiceAssignment,
  VoiceService,
} from '../shared/contracts'

export class MockStoryService implements StoryService {
  generateStory(options: StoryOptions): Observable<string> {
    const chunks = [
      'It was a dark and stormy night... ',
      'The old mansion stood silent, ',
      'its windows like hollow eyes watching the road. ',
      'A whisper drifted from within: "Who goes there?"'
    ]
    return concat(
      ...chunks.map((text, i) => timer(400 * (i + 1)).pipe(map(() => text)))
    )
  }
}

export class MockSpeakerParser implements SpeakerParser {
  async parseStory(text: string): Promise<ParsedStory> {
    const segments = [
      { type: 'narration' as const, text, emotion: 'neutral' as const },
      { type: 'dialogue' as const, text: 'Who goes there?', character: 'Voice', emotion: 'curious' as const },
    ]
    const characters = [
      { name: 'Narrator', appearances: 1 },
      { name: 'Voice', appearances: 1 },
    ]
    return { segments, characters }
  }
}

export class MockVoiceService implements VoiceService {
  listVoices?(): Promise<{ id: string; name: string }[]> {
    return Promise.resolve([
      { id: 'mock-1', name: 'Mock Voice 1' },
      { id: 'mock-2', name: 'Mock Voice 2' },
    ])
  }

  synthesize(story: ParsedStory, _assignments?: VoiceAssignment[]): Observable<AudioChunk> {
    const parts = story.segments.map((seg, idx) =>
      timer(300 * (idx + 1)).pipe(
        map(() => ({ audio: new ArrayBuffer(0), text: seg.text, timestamp: idx * 1000 }))
      )
    )
    return parts.length ? concat(...parts) : of({ audio: new ArrayBuffer(0), timestamp: 0 })
  }
}
