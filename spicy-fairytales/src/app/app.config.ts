/**
 * @fileoverview Base application configuration.
 *
 * ## Architecture Context
 * This file defines the core providers for the entire application, following
 * Angular's standalone component architecture. It sets up routing, server-side
 * rendering support, and dependency injection for shared services.
 *
 * ## Information Flow
 * 1. `main.ts` (for client-side) and `main.server.ts` (for server-side)
 *    bootstrap the application using this configuration.
 * 2. It imports `appRoutes` to configure the application's router.
 * 3. It provides essential services like `ThemeService` and `ToastService` at the
 *    root level, making them available application-wide.
 *
 * ## Contract Compliance
 * - This configuration object conforms to the `ApplicationConfig` interface from Angular.
 * - It uses DI tokens (`THEME_SERVICE`, `TOAST_SERVICE`) to provide service
 *   implementations, adhering to the seam-driven architecture.
 */

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { env } from './shared/env';
import { SPEAKER_PARSER, STORY_SERVICE, VOICE_SERVICE } from './shared/tokens';
import { MockSpeakerParser, MockStoryService, MockVoiceService } from './services/mocks';
import { HttpStoryService } from './services/http-story.service';
import { GrokSpeakerParser } from './services/grok-speaker-parser.service';
import { ElevenLabsVoiceService } from './services/elevenlabs-voice.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiRequestInterceptor } from './shared/http.interceptor';
import {
  AGE_SCORING_STRATEGY,
  GENDER_SCORING_STRATEGY,
  ROLE_SCORING_STRATEGY,
  NARRATOR_SCORING_STRATEGY
} from './shared/tokens';
import { AgeScoringStrategy } from './services/strategies/voice-scoring/age-scoring.strategy';
import { GenderScoringStrategy } from './services/strategies/voice-scoring/gender-scoring.strategy';
import { RoleScoringStrategy } from './services/strategies/voice-scoring/role-scoring.strategy';
import { StoryNarratorScoringStrategy } from './services/strategies/narrator-scoring/story-narrator-scoring.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([apiRequestInterceptor])),
    // Seam DI providers
    {
      provide: STORY_SERVICE,
      useClass: env.useMocks ? MockStoryService : HttpStoryService,
    },
    {
      provide: SPEAKER_PARSER,
      useClass: env.useMocks ? MockSpeakerParser : GrokSpeakerParser,
    },
    {
      provide: VOICE_SERVICE,
      useClass: env.useMocks ? MockVoiceService : ElevenLabsVoiceService,
    },
    // Voice scoring strategies
    {
      provide: AGE_SCORING_STRATEGY,
      useClass: AgeScoringStrategy,
    },
    {
      provide: GENDER_SCORING_STRATEGY,
      useClass: GenderScoringStrategy,
    },
    {
      provide: ROLE_SCORING_STRATEGY,
      useClass: RoleScoringStrategy,
    },
    {
      provide: NARRATOR_SCORING_STRATEGY,
      useClass: StoryNarratorScoringStrategy,
    },
  ],
};
