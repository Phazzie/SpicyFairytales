/**
 * ## Architecture Context
 * Dependency injection tokens for service contracts and strategy interfaces.
 *
 * This file centralizes all DI tokens used throughout the application, ensuring
 * consistent token naming and type safety for service injection.
 */

import { InjectionToken } from '@angular/core'
import type { SpeakerParser, StoryService, VoiceService } from './contracts'

export const STORY_SERVICE = new InjectionToken<StoryService>('STORY_SERVICE')
export const SPEAKER_PARSER = new InjectionToken<SpeakerParser>('SPEAKER_PARSER')
export const VOICE_SERVICE = new InjectionToken<VoiceService>('VOICE_SERVICE')
