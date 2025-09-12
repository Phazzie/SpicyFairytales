# Spicy FairyTales - AI Agent Instructions

This document is not just a set of rules; it's a guide to the philosophy behind Spicy FairyTales. Read this to understand *how* to think when contributing.

## 1. Guiding Principles

-   **Correctness > Clarity > Cleverness**: Code must first work as intended. Then, it must be simple enough for a new developer to understand. Only after achieving both should you consider clever optimizations. A "clever" but unreadable solution is technical debt.
-   **Fail Fast, Fail Cheap**: Our goal is to find problems at the earliest, cheapest stage. This is why we use a **Mock-First** workflow. A bug caught by a mock costs $0 in API fees. A bug found in production is a thousand times more expensive. Your first instinct should always be to replicate an issue with a mock.
-   **Proactive Problem-Solving**: Don't just complete the task. Think about its implications. If a change to the `StoryService` might affect how the `SpeakerParser` interprets text, flag it. Find the value others might miss by considering the entire pipeline, not just your isolated component.

## 2. Architecture: The Data Pipeline

The application is a pipeline that transforms data. Understand this flow.

`StoryOptions` -> **[StoryService]** -> `Raw Story (string)` -> **[SpeakerParser]** -> `ParsedStory (JSON)` -> **[VoiceService]** -> `AudioChunks`

-   **Contracts are King**: The single source of truth is `src/app/shared/contracts.ts`. All data structures flowing between services **MUST** adhere to these interfaces. UI components should only depend on these contracts, never on a concrete service like `grokService.ts`.
-   **The UI is a "Dumb" Client**: Hooks (e.g., `useStoryGenerator`) are responsible for orchestrating service calls. UI components (`StoryForm.tsx`) should be as simple as possible, taking props and rendering JSX. They should not contain complex business logic.

## 3. Critical Integration Risks & How to Mitigate Them

-   **Risk: The Parser-Synthesizer Contract**: The most fragile part of our system is the implicit contract between the `SpeakerParser` and the `VoiceService`. The parser generates structured JSON (a `ParsedStory`), and the voice service consumes it. If the parser's output format changes even slightly (e.g., a property name changes), the voice synthesis will break.
    -   **Mitigation**: Before modifying the `SpeakerParser`, check its usages in `voiceService.ts`. Always run tests that cover the full pipeline from text to audio.
-   **Risk: Cascading Failures**: A failure in `StoryService` will cascade down the entire pipeline.
    -   **Mitigation**: Each service is responsible for its own error handling. The `use...` hooks must translate service-specific errors into a standardized format that the UI can display gracefully. Never let a raw API error bubble up to a React component.

## 4. How to Avoid Technical Debt

-   **Adhere to Contracts Religiously**: If you need a new piece of data, add it to the interface in `contracts.ts` first. This forces you to think about the data flow and prevents one-off "hacks".
-   **Test the Mocks**: Write tests that validate the behavior of your mock services. Does `MockSpeakerParser` return a `ParsedStory` that matches the contract? This ensures your tests are valid before you even touch a real API.
-   **Isolate Logic in Hooks and Services**: If you find yourself writing complex logic inside a `.tsx` file, stop. That logic belongs in a hook or a service. This keeps components reusable and easy to test.

## 5. Key Commands

-   `npm start`: Starts the development server with Angular
-   `npm run build`: Creates a production-ready build
-   `npm test`: Runs unit tests with Karma
-   `npm run validate`: Validates environment and API keys
-   **Environment**: Set `VITE_USE_MOCKS=true` in `.env` for development

## 6. Current Implementation Status

### ✅ Completed Features
- **Mock-First Architecture**: All services have mock implementations for development
- **Real API Integration**: HttpStoryService (Grok), GrokSpeakerParser, ElevenLabsVoiceService
- **Angular 20**: Standalone components, signals, dependency injection
- **CI/CD Pipeline**: GitHub Actions with testing, building, deployment
- **Environment Management**: Validation scripts, API key configuration
- **UI Components**: Story form, display, voice assignment, audio player, export

### 🔄 Current Configuration
- **Default Mode**: Real APIs enabled (`env.useMocks = false`)
- **Fallback**: Mock services available for development
- **API Keys**: Configured in `.env` file with VITE_ prefix for Vite

### 🎯 Development Workflow
1. **Development**: Use mocks (`VITE_USE_MOCKS=true`) to avoid API costs
2. **Testing**: Switch to real APIs for integration testing
3. **Production**: Real APIs with proper error handling and fallbacks

## 7. API Integration Details

### Grok (x.ai)
- **Service**: `HttpStoryService`
- **Endpoint**: `https://api.x.ai/v1/chat/completions`
- **Streaming**: Real-time story generation with Server-Sent Events
- **Model**: `grok-beta`

### ElevenLabs
- **Service**: `ElevenLabsVoiceService`
- **Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}`
- **Streaming**: Audio chunk generation
- **Voices**: Pre-selected voice library with character assignment

### Speaker Parsing
- **Service**: `GrokSpeakerParser`
- **Method**: AI-powered dialogue detection and segmentation
- **Output**: Structured JSON with narration/dialogue/action segments
