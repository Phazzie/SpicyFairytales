/**
 * Primary Angular application configuration defining the dependency injection container and providers.
 * 
 * Central bootstrap configuration that establishes the application's service architecture,
 * routing, and core Angular features. Implements the mock-first development workflow by
 * conditionally binding service interfaces to mock or real implementations based on environment.
 * 
 * INPUT: Environment configuration, service implementations, Angular core providers
 * OUTPUT: Configured application with DI container, router, HTTP client, and service bindings
 * DEPENDENCIES: Angular core, router, HTTP client, all service implementations and mocks
 * INTEGRATIONS: Bootstrap point for entire application, consumed by main.ts
 * ARCHITECTURE: Implements dependency inversion with service abstraction, enables environment-based service selection
 * CRITICAL: Service provider bindings must match contracts.ts interfaces for type safety
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
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
import { authInterceptor } from './shared/http.interceptor';
import { GlobalErrorHandler } from './shared/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Global error handling
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Service DI providers (mocks for development; real services for production)
    { provide: STORY_SERVICE, useClass: env.useMocks ? MockStoryService : HttpStoryService },
    { provide: SPEAKER_PARSER, useClass: env.useMocks ? MockSpeakerParser : GrokSpeakerParser },
    { provide: VOICE_SERVICE, useClass: env.useMocks ? MockVoiceService : ElevenLabsVoiceService },
  ]
};
