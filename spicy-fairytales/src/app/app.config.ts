import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { env, validateEnvironment } from './shared/env';
import { httpInterceptor } from './shared/http.interceptor';
import { STORY_SERVICE, SPEAKER_PARSER, VOICE_SERVICE } from './shared/tokens';

// Import service implementations
import { MockStoryService } from './services/mocks';
import { MockSpeakerParser } from './services/mocks';
import { MockVoiceService } from './services/mocks';
import { HttpStoryService } from './services/http-story.service';
import { GrokSpeakerParser } from './services/grok-speaker-parser.service';
import { ElevenLabsVoiceService } from './services/elevenlabs-voice.service';

// Validate environment on app startup
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([httpInterceptor])),
    
    // Conditional service providers based on environment configuration
    {
      provide: STORY_SERVICE,
      useClass: env.useMocks ? MockStoryService : HttpStoryService
    },
    {
      provide: SPEAKER_PARSER,
      useClass: env.useMocks ? MockSpeakerParser : GrokSpeakerParser
    },
    {
      provide: VOICE_SERVICE,
      useClass: env.useMocks ? MockVoiceService : ElevenLabsVoiceService
    }
  ]
};
