/**
 * Angular dependency injection tokens defining service abstractions for the story generation pipeline.
 * 
 * Provides injectable tokens that decouple service interfaces from concrete implementations,
 * enabling mock services for development and flexible service swapping. Core architectural
 * pattern supporting the application's mock-first development workflow.
 * 
 * INPUT: Service interface definitions from contracts.ts
 * OUTPUT: Injectable tokens for StoryService, SpeakerParser, VoiceService abstractions
 * DEPENDENCIES: Angular DI system, service contracts for type safety
 * INTEGRATIONS: Used throughout application for service injection, enables mock/real service switching
 * ARCHITECTURE: Implements dependency inversion principle, supports contract-based development
 * CONFIGURATION: Tokens bound to concrete implementations in app.config.ts based on environment
 */
import { InjectionToken } from '@angular/core'
import type { SpeakerParser, StoryService, VoiceService } from './contracts'

export const STORY_SERVICE = new InjectionToken<StoryService>('STORY_SERVICE')
export const SPEAKER_PARSER = new InjectionToken<SpeakerParser>('SPEAKER_PARSER')
export const VOICE_SERVICE = new InjectionToken<VoiceService>('VOICE_SERVICE')
