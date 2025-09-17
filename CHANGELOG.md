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
## [0.3.0] - 2025-09-16

### Fixed
- **Security Vulnerabilities**: Resolved 2 low severity Vite vulnerabilities (GHSA-g4jq-h2w9-997c, GHSA-jqfw-vq24-v9c3)
- **TypeScript Compilation Errors**: Fixed 4 critical build errors preventing successful compilation
- **EventEmitter Usage**: Corrected template bindings from function calls to proper `.emit()` method calls
- **Missing Methods**: Implemented `parseCurrent()` method with error handling and user feedback
- **Dependency Security**: Updated @angular/build and Vite to secure versions

### Added
- **Modern Glassmorphism UI**: Complete visual redesign with contemporary design patterns
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

### Development Session
- **Error Resolution Workflow**: Systematic fix of 4 critical TypeScript errors
  - Identified errors: 3x EventEmitter calls (TS2348) + 1x missing method (TS2339)
  - Fixed story-form.component.ts: `onTestApi()` → `onTestApi.emit()`, `onGenerateTestStory(400/800)` → `onGenerateTestStory.emit(400/800)`
  - Implemented missing `parseCurrent()` method in generate.page.ts with error handling and toast notifications
  - Resolved duplicate method implementation and missing class closing brace
  - Verified successful build completion after all fixes

- **Documentation Updates**: Comprehensive documentation refresh
  - Updated LESSONS_LEARNED.md with TypeScript error patterns and resolution strategies
  - Enhanced CHANGELOG.md with v0.3.0 release notes and technical details
  - Modernized README.md with glassmorphism UI features and browser-based API management
  - Synchronized all documentation with current codebase state

- **Environment Setup**: Resolved build dependencies and tooling
  - Fixed missing node_modules and Angular CLI installation
  - Standardized environment variable naming (VITE_XAI_API_KEY)
  - Removed unused VITE_GROK_MODEL configuration
  - Added planning requirements to copilot development guidelines

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
