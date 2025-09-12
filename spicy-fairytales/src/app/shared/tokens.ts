import { InjectionToken } from '@angular/core'
import type { SpeakerParser, StoryService, VoiceService } from './contracts'

export const STORY_SERVICE = new InjectionToken<StoryService>('STORY_SERVICE')
export const SPEAKER_PARSER = new InjectionToken<SpeakerParser>('SPEAKER_PARSER')
export const VOICE_SERVICE = new InjectionToken<VoiceService>('VOICE_SERVICE')
