import { InjectionToken } from '@angular/core'
import type { SpeakerParser, StoryService, VoiceService, VoiceScoringStrategy, NarratorScoringStrategy } from './contracts'

export const STORY_SERVICE = new InjectionToken<StoryService>('STORY_SERVICE')
export const SPEAKER_PARSER = new InjectionToken<SpeakerParser>('SPEAKER_PARSER')
export const VOICE_SERVICE = new InjectionToken<VoiceService>('VOICE_SERVICE')

// Voice Scoring Strategy Tokens
export const AGE_SCORING_STRATEGY = new InjectionToken<VoiceScoringStrategy>('AGE_SCORING_STRATEGY')
export const GENDER_SCORING_STRATEGY = new InjectionToken<VoiceScoringStrategy>('GENDER_SCORING_STRATEGY')
export const ROLE_SCORING_STRATEGY = new InjectionToken<VoiceScoringStrategy>('ROLE_SCORING_STRATEGY')
export const NARRATOR_SCORING_STRATEGY = new InjectionToken<NarratorScoringStrategy>('NARRATOR_SCORING_STRATEGY')
