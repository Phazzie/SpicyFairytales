# Lessons Learned

A running log of insights, decisions, and retro items. Keep entries short and actionable. Add new sections per milestone.

## 2025-09-11 — Angular Alignment Pass
- React/Vite assumptions in docs caused confusion once Angular workspace landed; centralize tech choices early and keep docs in sync.
- Define DI tokens for major seams (story, parser, voice) up front; simplifies swapping mocks/real services.
- Prefer Observables for UI-bound streaming; wrap AsyncGenerators when needed to fit Angular patterns.
- Store "contracts" in one place and make all services depend on them; catches drift with `ng test` type checks.
- Use env flag `USE_MOCKS` to avoid API costs during development.

### Addendum: First scaffold & compile
- Keep streaming interfaces uniform (Observable at seam) to simplify component binding.
- Fetch + ReadableStream is likely needed for real-time story streaming; HttpClient for non-stream APIs.
- Provide tokens at app root so pages/components remain dumb and testable.

## 2025-09-12 — Narrator Voice Feature Implementation

### Architecture & Design Decisions
- **Seam-Driven Contracts Pay Off**: The existing `ParsedStorySegment` interface already supported `narration` types, proving the value of comprehensive contracts from the start.
- **Store State Management**: Adding narrator voice to the voice store required careful consideration of reactive updates; signals made this seamless but required proper initialization order.
- **Service Method Signatures**: Optional parameters (like `narratorVoice?`) provide backward compatibility while enabling new features without breaking existing code.

### TypeScript & Type Safety
- **Interface Extensions**: Adding `NarratorVoiceAssignment` and `AudioChunk` segment types required careful type casting to maintain strict type checking.
- **Method Overloading**: The duplicate `recommendNarratorVoice` methods highlighted the importance of consistent return types across service implementations.
- **Import Organization**: Adding new interfaces to existing contracts required updating multiple service files, emphasizing the need for centralized type definitions.

### UI/UX Implementation
- **Component Integration**: Enhancing existing `CharacterVoicesComponent` rather than creating new components reduced complexity and maintained consistent user experience.
- **Reactive State**: Using Angular signals for narrator voice state provided excellent reactivity but required careful handling of initialization order.
- **User Feedback**: Toast notifications for voice assignments proved valuable for user confidence and error communication.

### Performance & Error Handling
- **Async Processing**: Multi-segment audio processing revealed the importance of proper error boundaries and graceful degradation when voice synthesis fails.
- **Fallback Mechanisms**: Default narrator voice assignment ensures the system remains functional even when smart recommendations fail.
- **Memory Management**: Audio chunk processing highlighted the need for proper cleanup of audio buffers and blob URLs.

### Development Workflow
- **Incremental Testing**: Building after each major change caught TypeScript errors early, preventing complex debugging sessions.
- **Documentation Updates**: Updating README and CHANGELOG during development (not after) ensures documentation stays current with implementation.
- **Code Review Process**: Self-reviewing changes before commit revealed several type safety issues and architectural improvements.

### Future Considerations
- **Extensibility Patterns**: The narrator voice feature established patterns for adding emotion-based voice modulation and multiple narrator styles.
- **API Design**: Optional parameters in service methods provide a clean path for feature flags and gradual rollouts.
- **Testing Strategy**: The implementation revealed the need for integration tests covering the full audio synthesis pipeline.

## 2025-09-16 — TypeScript Error Resolution & Modern UI

### EventEmitter Pattern Corrections
- **Template Binding Errors**: Common mistake calling EventEmitter outputs as functions `(click)="output()"` instead of using `.emit()` method `(click)="output.emit()"`.
- **Error Diagnosis**: TypeScript error TS2348 clearly indicates EventEmitter misuse; systematic search and replace across templates resolved multiple instances.
- **Component Contract**: Output properties are EventEmitters for parent communication, not callable methods within the component itself.

### Missing Method Implementation
- **Template-Component Sync**: Template bindings like `(click)="parseCurrent()"` must have corresponding component methods; TypeScript error TS2339 identifies these gaps.
- **Method Design**: Implemented `parseCurrent()` with proper error handling, loading states, and user feedback using toast notifications.
- **Code Reuse**: Leveraged existing `testSpeakerParsing()` logic to avoid duplication while adding UI-specific error handling.

### Build & Development Environment
- **Dependency Management**: Missing `node_modules` caused CLI tool errors; `npm install` resolved missing Angular CLI and other development dependencies.
- **Build Verification**: Running `npm run build` after fixes confirmed all TypeScript compilation errors resolved successfully.
- **Directory Context**: Build commands must run from correct project directory; workspace structure affects command execution paths.

### Modern UI Implementation Insights
- **Glassmorphism Effects**: Backdrop blur and transparent backgrounds create modern visual depth without overwhelming content.
- **Component Architecture**: Modern UI patterns work best with card-based layouts and consistent spacing systems using CSS custom properties.
- **Responsive Design**: Mobile-first approach with progressive enhancement ensures compatibility across device types.

### Git Workflow & PR Management
- **Systematic Fixes**: Grouping related errors (EventEmitter calls, missing methods) into logical commits improves code review process.
- **Comprehensive Testing**: Build verification before committing prevents breaking changes from reaching the repository.
- **Documentation Sync**: Updating docs alongside code changes maintains project knowledge base accuracy.

### Error Prevention Strategies
- **Type Safety**: Strict TypeScript configuration catches template binding errors at compile time rather than runtime.
- **Component Method Coverage**: Ensure all template bindings have corresponding component methods before finalizing components.
- **Incremental Development**: Fix errors in small batches to isolate root causes and prevent cascading issues.

## How to Contribute to This Doc
- Add a dated section with 3–7 concise bullets.
- Link to PRs or commits when relevant.
- Prefer specific “change we’ll make next time” over vague observations.
