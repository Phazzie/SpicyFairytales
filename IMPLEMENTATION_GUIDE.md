# DarkStory Generator - Implementation Guide

## ✅ **IMPLEElevenLabs Integration (Day 1-2)
- [x] `MockVoiceService`
- [x] Real `VoiceService` integrates ElevenLabs (token from env)
- [x] Stream audio segments (AsyncGenerator or Observable wrapper)
- [x] Cache segments; handle rate limitsTION CHECKLIST**
# DarkStory Generator - Angular Implementation Guide

This guide aligns the implementation with our Angular 20 project in `spicy-fairytales/` using standalone components, Angular routing, HttpClient, and DI.

## ✅ Angular Implementation Checklist

### Week 1: Foundation & Story Generation

Setup (Day 1)
- [x] Confirm Angular workspace (Angular CLI 20) and Node LTS
- [x] Create `contracts.ts` under `src/app/shared/` for cross-service types
- [x] Configure environment variables (documented in `README.md`)
- [x] Add `EnvironmentService` for safe config access
- [x] Set up routing (`app.routes.ts`) for Home, Generate, Library
- [x] Create mock services and wire via Angular DI tokens

Story Service (Day 2-3)
- [x] Implement `MockStoryService` that streams text via RxJS `Observable`
- [x] Implement `StoryService` using `HttpClient` with streaming/fetch
- [x] Add retry (exponential backoff) with `retryBackoff`
- [x] Cancellation support via `AbortController`
- [x] Service factory using `InjectionToken` and provider switch by env flag
- [x] Unit tests with TestBed + marble tests for streaming

UI Components (Day 4-5)
- [x] `StoryFormComponent` (standalone):
  - Genre select, tone, length, themes, custom prompt
  - Reactive Forms with validation + submit state
- [x] `StoryDisplayComponent` (standalone):
  - Streamed text rendering, copy, save, reading time
- [x] Shared UI: Button, Card, Spinner (standalone + `@angular/cdk` when helpful)
- [x] Environment validation script

### Week 2: Speaker Detection & Voice Assignment

Speaker Parser (Day 1-2)
- [x] `MockSpeakerParser` service
- [x] Real parser service using provider API
- [x] Prompt template for detection
- [x] Parse narration vs dialogue, detect characters + emotions
- [x] Generate SSML; handle unnamed speakers/actions

Character Voice Assignment (Day 3-4)
- [x] Voice assignment algorithm service
- [x] `CharacterVoicesComponent` with dropdown per character
- [x] Manual overrides persisted in state
- [x] Character cards + appearance count

Testing & Refinement (Day 5)
- [x] Unit tests for parser
- [x] Edge cases (no dialogue, malformed punctuation)
- [x] Fallback modes and clear error messages

### Week 3: Voice Synthesis & Audio

ElevenLabs Integration (Day 1-2)
- [x] `MockVoiceService`
- [x] Real `VoiceService` integrates ElevenLabs (token from env)
- [x] Stream audio segments (AsyncGenerator or Observable wrapper)
- [x] Cache segments; handle rate limits

Audio Player (Day 3-4)
- [x] `AudioPlayerComponent` using Web Audio API
- [x] Controls: play/pause/stop, progress, seek
- [x] Segment list and text highlight sync
- [x] Volume + playback speed

Export System (Day 5)
- [x] `ExportService` to combine audio and emit TXT/JSON/MP3
- [x] Metadata (title, date, characters)
- [x] Progress UI for large exports

### Week 4: Real Service Implementations

Grok Integration (Day 1)
- [x] `HttpStoryService` with streaming fetch + ReadableStream
- [x] Environment variable configuration (VITE_GROK_API_KEY)
- [x] Error handling for API failures and rate limits

Speaker Parser (Day 2)
- [x] `GrokSpeakerParser` for automatic dialogue detection
- [x] JSON parsing of story segments (narration/dialogue/action)
- [x] Character tracking and appearance counting

ElevenLabs Integration (Day 3)
- [x] `ElevenLabsVoiceService` with voice assignment
- [x] Audio streaming and concatenation
- [x] Voice selection and character mapping

---

## Angular Service Contracts & DI

- Define contracts in `src/app/shared/contracts.ts`:
  - StoryOptions, ParsedStory, VoiceAssignment, AudioChunk, etc.
- Create `InjectionToken`s for seams:
  - `STORY_SERVICE`, `SPEAKER_PARSER`, `VOICE_SERVICE`
- Provide mocks in development via `provideEnvironment` or `providers` in `app.config.ts` based on an env flag.

Example tokens
```ts
export const STORY_SERVICE = new InjectionToken<StoryService>('STORY_SERVICE')
export const SPEAKER_PARSER = new InjectionToken<SpeakerParser>('SPEAKER_PARSER')
export const VOICE_SERVICE = new InjectionToken<VoiceService>('VOICE_SERVICE')
```

App config wiring (simplified)
```ts
providers: [
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
```

---

## Component Plan (Standalone)

- `StoryFormComponent` — reactive form, emits `StoryOptions`
- `StoryDisplayComponent` — subscribes to streaming story text
- `CharacterVoicesComponent` — list of characters + voice selection
- `AudioPlayerComponent` — playback UI and segment sync
- `ExportPanelComponent` — export options + progress

Use Angular signals for simple UI state; RxJS for streaming and service seams.

---

## Networking & Interceptors

- Use `HttpClient` for non-stream requests; use `fetch` with `ReadableStream` for SSE/NDJSON streaming if needed
- Add `HttpInterceptor` for auth headers, retry, and logging ✅
- Use `AbortController` for user-initiated cancellation

---

## Testing

- Services: Jasmine + TestBed, marble tests for streams
- Components: TestBed + Harnesses, avoid direct service imports (use tokens)
- E2E: Choose Playwright/Cypress if needed (optional)

---

## CI/CD Essentials

- [x] Type check: `ng test --watch=false` and `ng build`
- [x] Lint: ESLint + Prettier configured
- [x] GitHub Actions: Complete CI/CD pipeline with testing, building, and deployment
- [x] Quality checks: Security scanning, dependency auditing
- [x] Automated deployment: Vercel integration for staging/production (primary), Netlify available as alternative
- [x] Dependabot: Automated dependency updates
- [x] Code owners and PR templates for standardized contributions

---

## Quick Dev Notes

- Keep UI components dumb; orchestrate in services or small facade stores
- Follow contracts strictly; update `contracts.ts` first when data needs change
- Start with mocks (`env.useMocks=true`), then swap real services

---

## Environment Variables

Document in `README.md` and inject via `EnvironmentService`:
- `GROK_API_KEY`
- `ELEVENLABS_API_KEY`
- `USE_MOCKS` (boolean)

Expose only necessary values to the browser; never commit secrets.

- Replace all mocks with real services
- Add error handling
- Test with real API keys
- Deploy!

---

## 💡 **WHY THIS APPROACH WORKS FOR YOU**

### **Benefits of This Design:**
1. **Contracts = Documentation** - The contracts tell you exactly what each part needs
2. **Mocks = Fast Development** - Build without API keys or waiting
3. **Simple CI = No Overhead** - Just enough to catch bugs
4. **Modular = Future-Proof** - Easy to add plugins later

### **Avoiding Technical Debt:**
- Start with contracts (interfaces)
- Build against mocks
- Test the important stuff
- Keep services separate
- Document as you go

---

## 📝 **QUICK START COMMANDS**

```bash
# Set up project
npm create vite@latest darkstory-generator -- --template react-ts
cd darkstory-generator

# Install essentials only
npm install axios zustand

# Development
npm run dev  # Start with mocks
npm test     # Run basic tests
npm run type-check  # Validate contracts

# Environment variables (.env)
VITE_GROK_API_KEY=your_key_here
VITE_ELEVENLABS_API_KEY=your_key_here
```
