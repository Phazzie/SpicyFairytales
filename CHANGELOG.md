# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres loosely to Semantic Versioning.

## [0.2.0] - 2025-09-12
### Added
- **Narrator Voice Feature**: Complete implementation of dedicated narrator voice system
  - Smart narrator voice recommendations based on story analysis
  - Multi-segment audio processing (narration + dialogue)
  - Enhanced voice assignment service with narrator intelligence
  - Updated ElevenLabs voice service to handle narration segments
  - New UI components for narrator voice selection
  - Comprehensive type safety with NarratorVoiceAssignment interface

### Enhanced
- Voice Assignment Algorithm: Extended to support narrator voice recommendations
- Audio Synthesis Pipeline: Now processes narration and dialogue segments separately
- UI Components: Enhanced character voices component with narrator voice selector
- Type System: Added proper TypeScript interfaces for narrator voice functionality

### Technical
- Updated service contracts to support narrator voice parameters
- Enhanced voice store with narrator voice state management
- Improved error handling and fallback mechanisms
- Performance optimizations for multi-segment audio processing

## [0.1.0] - 2025-09-11
### Added
- Initial Angular alignment of Implementation Guide.
- Seed PRD (Enhanced) added to repo root.
- Repo scaffolding for Angular app under `spicy-fairytales/`.

### Notes
- Future entries should be added under a new heading with date.

## [0.1.1] - 2025-09-11
### Added
- Service seams and DI tokens: `STORY_SERVICE`, `SPEAKER_PARSER`, `VOICE_SERVICE`.
- Mock services: `MockStoryService`, `MockSpeakerParser`, `MockVoiceService`.
- Env toggle `useMocks` and provider wiring in `app.config.ts`.
- UI scaffolding: `StoryFormComponent`, `StoryDisplayComponent`, `GeneratePageComponent`.
- Routing to `/generate` as default.

### Build
- Angular build passes (browser + server bundles). SSR output generated.
