# Spicy FairyTales - GitHub Copilot Instructions

**ALWAYS** follow these instructions first. Only search for additional context if the information here is incomplete or found to be in error.

## Quick Start Commands (VALIDATED)

Navigate to the main application directory first:
```bash
cd spicy-fairytales
```

**Bootstrap and validate the environment:**
```bash
# Install dependencies - NEVER CANCEL: Can take up to 5 minutes due to network
PUPPETEER_SKIP_DOWNLOAD=true npm install  # Skip puppeteer if network restricted
npm run validate                           # Validates environment setup
```

**Build and test (CRITICAL TIMINGS):**
```bash
npm run build                             # NEVER CANCEL: Takes ~20 seconds, set timeout to 60+ seconds
npm test -- --no-watch --no-progress --browsers=ChromeHeadlessNoSandbox  # NEVER CANCEL: Takes ~20 seconds, set timeout to 60+ seconds
```

**Run the development server:**
```bash
npm start                                 # Starts on http://localhost:4200, takes ~10 seconds to build
```

**API Testing:**
```bash
npm run test-apis                         # Tests real API integrations, takes ~20 seconds
```

## Development Workflow

### 1. Environment Setup
```bash
cd spicy-fairytales
cp .env.example .env                      # Copy environment template
# Edit .env with your API keys OR set VITE_USE_MOCKS=true for development
npm run validate                          # ALWAYS validate before proceeding
```

### 2. Development Mode
```bash
npm start                                 # Development server with hot reload
# Open http://localhost:4200 in browser
# Use mock services by default or configure real API keys
```

### 3. Code Quality
```bash
npx prettier --check src/                # Check code formatting
npx prettier --write src/                # Fix formatting issues
# Note: No ESLint configured - relies on TypeScript compiler and Prettier
```

## Validation Requirements

**MANUAL VALIDATION SCENARIOS:**
Always test these scenarios after making changes:

1. **Basic Application Launch:**
   ```bash
   npm start
   # Verify app loads at http://localhost:4200
   # Check console for errors (some animation warnings are expected)
   ```

2. **Story Generation Flow:**
   - Select character type (Werewolf/Vampire/Faerie)
   - Choose themes and settings
   - Click "Generate Story" or "API Test"
   - Verify loading states and completion

3. **API Integration Test:**
   ```bash
   npm run test-apis
   # Should complete in ~20 seconds
   # Tests Grok and ElevenLabs APIs (may fail if keys not configured)
   ```

4. **Build Validation:**
   ```bash
   npm run build
   # NEVER CANCEL: Takes ~20 seconds, generates dist/ folder
   # Should complete without errors
   ```

## Architecture Overview

The application is an Angular 20 standalone components app with this data pipeline:

`StoryOptions` → **[StoryService]** → `Raw Story (string)` → **[SpeakerParser]** → `ParsedStory (JSON)` → **[VoiceService]** → `AudioChunks`

### Key Files and Directories:
- `src/app/shared/contracts.ts` - **SINGLE SOURCE OF TRUTH** for all data interfaces
- `src/app/services/` - Service implementations (HTTP, mocks, voice, parsing)
- `src/app/pages/generate.page.ts` - Main story generation UI and logic
- `src/app/stores/` - State management with Angular signals
- `.env` - Environment configuration (copy from .env.example)

### Critical Integration Points:
- **Parser-Voice Contract**: Changes to `SpeakerParser` output must match `VoiceService` input
- **Mock-Real Service Switch**: Controlled by `VITE_USE_MOCKS` environment variable
- **API Keys**: Required for Grok (x.ai) and ElevenLabs, stored in .env or browser localStorage

## Development Guidelines

### 1. Mock-First Development
```bash
# Always start with mocks for development
echo "VITE_USE_MOCKS=true" >> .env
npm start
# Switch to real APIs only for integration testing
```

### 2. Before Making Changes
- **Always** run `npm run validate` first
- **Always** run existing tests: `npm test`
- **Always** check contracts in `src/app/shared/contracts.ts`

### 3. After Making Changes
- **Always** test the complete user flow manually
- **Always** run `npx prettier --check src/` (fix with --write)
- **Always** verify build still works: `npm run build`

## Environment Configuration

### API Keys Setup:
```bash
# Method 1: Environment file (recommended for development)
cp .env.example .env
# Edit .env with your keys:
# VITE_XAI_API_KEY=your_key_here
# VITE_ELEVENLABS_API_KEY=your_key_here

# Method 2: Browser-based (production)
# Use the API Keys panel in the UI
# Keys stored in browser localStorage
```

### Mock vs Real API Mode:
```bash
# Development (free, fast, no API costs)
VITE_USE_MOCKS=true

# Production/Testing (requires API keys)
VITE_USE_MOCKS=false
```

## Common Commands Reference

### Build Commands (CRITICAL TIMINGS)
```bash
npm run build                             # Production build: ~20 seconds, NEVER CANCEL, timeout 60+ seconds
npm run build:github-pages                # GitHub Pages build: ~20 seconds, NEVER CANCEL, timeout 60+ seconds  
npm run build:vercel                      # Vercel deployment build: ~20 seconds, NEVER CANCEL, timeout 60+ seconds
npm run watch                             # Development watch build: continuous rebuilding
```

### Test Commands
```bash
npm test                                  # Unit tests: ~20 seconds, NEVER CANCEL, timeout 60+ seconds
npm test -- --no-watch --no-progress --browsers=ChromeHeadlessNoSandbox  # CI mode
```

### Validation Commands
```bash
npm run validate                          # Environment validation: ~2 seconds
npm run test-apis                         # API integration test: ~20 seconds (may fail without keys)
```

### Development Server
```bash
npm start                                 # Development server: http://localhost:4200, ~10 second startup
npm run serve:ssr:spicy-fairytales       # SSR server (after build)
```

## CI/CD Pipeline

The project uses GitHub Actions with these key jobs:
- **Test**: Runs unit tests with Chrome headless
- **Build**: Creates production build artifacts
- **Deploy**: GitHub Pages deployment (automatic on main branch)

### Key CI Files:
- `.github/workflows/ci-cd.yml` - Main CI pipeline
- `.github/workflows/github-pages.yml` - GitHub Pages deployment
- `.github/workflows/quality.yml` - Code quality checks

## Troubleshooting

### Common Issues:

1. **npm install fails with puppeteer error:**
   ```bash
   PUPPETEER_SKIP_DOWNLOAD=true npm install
   ```

2. **Build fails with memory issues:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

3. **Tests fail with Chrome not found:**
   ```bash
   # Install Chrome or use different browser in karma.conf.js
   npm test -- --browsers=ChromeHeadlessNoSandbox
   ```

4. **API tests fail:**
   ```bash
   # Check API keys in .env or switch to mocks
   echo "VITE_USE_MOCKS=true" >> .env
   npm run test-apis
   ```

### Build Time Expectations:
- **Fresh npm install**: 1-5 minutes (depending on network)
- **Development build**: ~10 seconds
- **Production build**: ~20 seconds
- **Unit tests**: ~20 seconds
- **API integration tests**: ~20 seconds

**NEVER CANCEL BUILD OR TEST COMMANDS** - They may appear to hang but will complete. Always set timeouts of 60+ seconds for builds and 30+ seconds for tests.

## Technology Stack

- **Framework**: Angular 20 with standalone components
- **Language**: TypeScript with strict mode
- **Styling**: SCSS with responsive design
- **State Management**: Angular signals
- **Testing**: Karma + Jasmine
- **Build Tool**: Angular CLI with Vite
- **APIs**: Grok (x.ai) for story generation, ElevenLabs for voice synthesis
- **Deployment**: GitHub Pages, Vercel support included

## Development Philosophy

1. **Correctness > Clarity > Cleverness**: Code must work, be readable, then optimized
2. **Mock-First Development**: Always develop with mocks, test with real APIs
3. **Contract-Driven Architecture**: All services must implement interfaces in `contracts.ts`
4. **Fail Fast**: Catch errors early in the development pipeline
5. **Manual Validation**: Always test user workflows after changes
