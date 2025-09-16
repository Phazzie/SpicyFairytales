# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres loosely to Semantic Versioning.

## [0.3.0] - 2025-09-16
### Fixed
- **TypeScript Compilation Errors**: Resolved all critical build-blocking errors
  - Fixed EventEmitter template binding errors (TS2348): Changed `(click)="output()"` to `(click)="output.emit()`
  - Implemented missing `parseCurrent()` method for Parse Speakers functionality (TS2339)
  - Added proper error handling and user feedback with toast notifications
  - Verified build passes successfully with all TypeScript checks

### Enhanced
- **Modern UI Implementation**: Complete glassmorphism design system
  - Floating API test cards with backdrop blur effects
  - Hero section with gradient text and atmospheric backgrounds
  - Card-based architecture with consistent spacing and shadows
  - Enhanced form controls with custom styling and animations
  - Responsive design with mobile-first approach

### Added
- **API Key Management**: Comprehensive local storage system
  - Browser-based API key storage for Grok and ElevenLabs
  - Save/load/clear functionality with user feedback
  - Real-time API key status indicators
  - Session persistence without requiring page reloads

- **Full Pipeline Testing**: End-to-end API integration testing
  - Complete workflow testing: Story generation → Speaker parsing → Audio synthesis
  - Comprehensive error handling with detailed user feedback
  - Timeout protection for long-running operations
  - Success validation for each pipeline stage

### Technical
- **Build System**: Enhanced deployment configurations
  - Vercel deployment support with proper SPA routing
  - GitHub Pages deployment with static site generation
  - Updated bundle size limits for enhanced UI styles
  - Cross-platform CI/CD pipeline improvements

- **Code Quality**: Improved development patterns
  - Proper EventEmitter usage patterns established
  - Comprehensive error boundaries and user feedback
  - Toast notification system for all user interactions
  - Loading state management across all components

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
