# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres loosely to Semantic Versioning.

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
