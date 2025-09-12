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
import { authInterceptor } from './shared/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes), provideClientHydration(withEventReplay()),
  provideHttpClient(withInterceptors([authInterceptor])),
  // Seam DI providers (mocks for now; swap with real services later)
  { provide: STORY_SERVICE, useClass: env.useMocks ? MockStoryService : HttpStoryService },
  { provide: SPEAKER_PARSER, useClass: env.useMocks ? MockSpeakerParser : GrokSpeakerParser },
  { provide: VOICE_SERVICE, useClass: env.useMocks ? MockVoiceService : ElevenLabsVoiceService },
  ]
};
