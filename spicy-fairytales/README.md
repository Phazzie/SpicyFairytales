# Spicy FairyTales

An AI-powered story generation application that creates interactive audio fairy tales with voice synthesis.

## Features

- 🎭 AI-generated stories using Grok (x.ai)
- 🗣️ Automatic speaker detection and parsing
- 🔊 Voice synthesis with ElevenLabs
- 🎵 Interactive audio player with segment navigation
- 📤 Export stories as audio files
- 🔄 Mock-first development architecture

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for Grok and ElevenLabs (optional - can use mocks)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spicy-fairytales
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```bash
VITE_GROK_API_KEY=your_grok_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_USE_MOCKS=false  # Set to true for development without API keys
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:4200`.

### API Keys Setup

#### Grok API (x.ai)
1. Visit [console.x.ai](https://console.x.ai/)
2. Create an account and get your API key
3. Add it to your `.env` file as `VITE_GROK_API_KEY`

#### ElevenLabs API
1. Visit [elevenlabs.io](https://elevenlabs.io/)
2. Sign up and get your API key
3. Add it to your `.env` file as `VITE_ELEVENLABS_API_KEY`

### Mock Mode

For development without API keys, set `VITE_USE_MOCKS=true` in your `.env` file. This will use mock services that simulate the real APIs.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Architecture

This application follows a **mock-first development** approach with clean architecture:

- **Contracts**: Service interfaces in `src/app/shared/contracts.ts`
- **Dependency Injection**: Service seams with tokens for easy testing
- **Mock Services**: Development-friendly implementations
- **Real Services**: Production API integrations
- **Signal-based State**: Reactive UI with Angular signals

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
