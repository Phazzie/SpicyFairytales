# SpicyFairytales 🎭

**AI-Powered Interactive Storytelling Platform**

Transform your ideas into immersive audio stories with AI-generated narratives and professional voice synthesis. Create engaging fairy tales, adventure stories, and custom narratives with intelligent character voice assignment.

![Angular](https://img.shields.io/badge/Angular-20.3.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.0-blue)
![RxJS](https://img.shields.io/badge/RxJS-7.8.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### � Modern Glassmorphism UI
- **Glassmorphism Design**: Frosted glass effects with backdrop blur for a modern, professional look
- **Hero Section**: Eye-catching header with floating API test cards and gradient text effects
- **Card-Based Architecture**: Elegant glassmorphism components with consistent spacing and shadows
- **Enhanced Animations**: Smooth entrance animations, hover effects, and micro-interactions
- **Responsive Design**: Mobile-first approach with seamless cross-device experience
- **Atmospheric Backgrounds**: Animated gradient backgrounds with subtle depth effects

### 🔑 Comprehensive API Management
- **Local Storage Integration**: Secure browser-based API key storage (no server storage)
- **Real-Time Key Status**: Live indicators for API key availability and validation
- **Save/Load/Clear Functionality**: Complete key management with user feedback
- **Session Persistence**: Keys persist across browser sessions without page reloads
- **Security Focus**: Keys stored locally only, never transmitted to external servers

### 🧪 Full Pipeline Testing
- **End-to-End Testing**: Complete workflow validation from story generation to audio synthesis
- **Real API Integration**: Test actual Grok and ElevenLabs API connectivity
- **Error Handling**: Comprehensive error detection with detailed user feedback
- **Timeout Protection**: Automatic timeout handling for long-running operations
- **Success Validation**: Verification that each pipeline stage completes successfully

### �🎭 Smart Voice Assignment
- **AI-Powered Analysis**: Automatically analyzes character traits from story content
- **Intelligent Matching**: Matches voices based on age, gender, personality, and role
- **Confidence Scoring**: Provides confidence levels and alternative recommendations
- **Manual Override**: Full control with manual voice selection when needed
- **Narrator Voice Separation**: Dedicated narrator voice for professional storytelling
- **Smart Narrator Recommendations**: AI selects optimal narrator voice based on story tone and genre

### 🎵 Professional Audio Synthesis
- **ElevenLabs Integration**: High-quality voice synthesis with 100+ voices
- **Streaming Audio**: Real-time audio generation and playback
- **Multiple Formats**: Support for various audio formats and quality settings

### 🤖 Advanced AI Storytelling
- **Grok Integration**: Powered by xAI's Grok-4-0709 model
- **Streaming Generation**: Real-time story generation with live updates
- **Customizable Prompts**: Flexible story generation with themes, tones, and lengths

### 🔧 Developer Experience
- **Angular 20**: Latest Angular with standalone components and signals
- **Type Safety**: Full TypeScript with strict type checking
- **Modular Architecture**: Clean separation of concerns with service seams
- **Extensible Design**: Built for easy addition of new features
- **Modern Build System**: Optimized for multiple deployment targets (Vercel, GitHub Pages)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Phazzie/SpicyFairytales.git
   cd SpicyFairytales/spicy-fairytales
   ```

   Alternative platforms:
   - **Vercel**: Primary deployment platform with optimized Angular configuration
   - **Netlify**: Alternative deployment option (workflows removed from CI/CD)
   - **Firebase Hosting**: Supported with Angular Universal

   **Alternative: Browser-Based Setup**
   - Skip the `.env` file setup
   - Use the in-app API key management panel
   - Keys are stored securely in your browser's localStorage
   - No server-side storage required

4. **Validate environment**
   ```bash
   npm run validate
   ```

5. **Start development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:4200`

## 📖 Usage

### Creating Your First Story

#### Method 1: Browser-Based (Recommended)

1. **Set up API keys in the browser**:
   - Open the application
   - Use the "🔑 API Keys" panel at the top
   - Paste your xAI (Grok) and ElevenLabs API keys
   - Click "Save Keys" - they're stored securely in your browser

2. **Test the API integration**:
   - Click "🔥 Test Real APIs" in the floating test card
   - This validates your full pipeline: Grok → Speaker Parser → ElevenLabs
   - Watch the real-time status updates

3. **Create your story**:
   - Fill out the story form with genre, tone, length, and themes
   - Click "Generate Story" to start AI-powered creation
   - Watch the story stream in real-time

4. **Parse speakers and assign voices**:
   - Click "🗣️ Parse Speakers" to identify characters
   - Use "🧠 Smart Assign" for AI-powered voice recommendations
   - Review suggestions with confidence scores and reasoning
   - Choose a dedicated narrator voice for professional storytelling

5. **Generate audio**:
   - Click "🔊 Synthesize Audio" to create professional voice audio
   - Listen to your story with character-appropriate voices
   - Export or share your creation

#### Method 2: Command Line API Testing

Test the full pipeline with real APIs:
```bash
npm run test-apis
```

This will:
- Generate a test story using Grok
- Parse speakers automatically
- Synthesize audio using ElevenLabs
- Validate the complete workflow

## 🏗️ Architecture

### Seam-Driven Design

This project follows **Seam-Driven Development (SDD)** principles:

- **Seams**: Boundaries between modules with strict contracts
- **Contracts**: Formal interfaces defining data structures and behaviors
- **Testability**: Each seam can be tested in isolation
- **Modularity**: Easy to swap implementations (real vs mock services)

### Key Components

```
src/app/
├── services/           # Business logic services
│   ├── voice-assignment.service.ts    # Smart voice matching
│   ├── http-story.service.ts          # Grok integration
│   ├── elevenlabs-voice.service.ts    # Voice synthesis
│   └── grok-speaker-parser.service.ts # Speaker detection
├── features/           # Feature modules
│   ├── story/          # Story generation UI
│   ├── voices/         # Voice assignment UI
│   └── audio/          # Audio playback
├── shared/             # Shared utilities
│   ├── contracts.ts    # Service contracts
│   ├── tokens.ts       # DI tokens
│   └── env.ts          # Environment config
└── stores/             # State management
    ├── story.store.ts  # Story state
    └── voice.store.ts  # Voice assignments
```

### Smart Voice Assignment Algorithm

The voice assignment system uses a sophisticated scoring algorithm:

```typescript
// Scoring weights (configurable)
const WEIGHTS = {
  age: 3,        // Age match importance
  gender: 2,     // Gender match importance
  role: 1,       // Role match importance
  base: 5        // Neutral starting score
}

// Algorithm steps:
// 1. Extract character traits from story
// 2. Score each available voice against traits
// 3. Sort by total score
// 4. Return top recommendation with alternatives
// 5. Calculate confidence based on score distribution
```

### Narrator Voice Intelligence

The narrator voice system intelligently selects voices based on story analysis:

```typescript
// Story analysis for narrator voice selection
const analysis = {
  tone: 'whimsical' | 'dramatic' | 'formal' | 'casual',
  genre: ['fantasy', 'adventure', 'romance'],
  length: 'short' | 'medium' | 'long'
}

// Voice recommendations:
// - Whimsical stories: Bella (engaging, youthful)
// - Dramatic stories: Rachel (clear, professional)
// - Formal stories: Rachel (authoritative)
// - Casual stories: Antoni (relaxed, friendly)
```

## 🔧 Development

### Available Scripts

```bash
npm start              # Start development server
npm run build          # Build for production
npm run build:github-pages  # Build for GitHub Pages deployment  
npm test               # Run unit tests
npm run validate       # Validate environment setup
npm run test-apis      # Test API integrations
```

### Deployment

#### Active Deployment Platforms

**GitHub Pages (Primary)**
- **Live Demo**: [https://phazzie.github.io/SpicyFairytales/](https://phazzie.github.io/SpicyFairytales/)
- **Deployment**: Automatic on every push to `main` branch
- **Configuration**: Optimized for static hosting with client-side routing support
- **Workflow**: `.github/workflows/github-pages.yml`

**Vercel (Secondary)**
- **Deployment**: Automatic preview on PRs, production on `main` branch  
- **Configuration**: Angular-optimized with SPA routing
- **Workflow**: `.github/workflows/vercel-deploy.yml`
- **CLI Management**: See [VERCEL_GUIDE.md](./VERCEL_GUIDE.md) for token setup and usage

The GitHub Pages build uses:
- Static rendering for optimal loading performance
- Proper base href configuration for subdirectory deployment
- SPA routing support via 404.html redirect mechanism

#### Deployment Management

For Vercel CLI usage and token management:
```bash
# See comprehensive guide
cat VERCEL_GUIDE.md

# Quick commands
npx vercel login          # Authenticate
npx vercel whoami         # Check login status
npx vercel                # Deploy preview
npx vercel --prod         # Deploy production
```

Alternative platforms:
- Vercel: Primary deployment platform with optimized Angular configuration
- Netlify: Alternative deployment option (workflows removed from CI/CD)
- Firebase Hosting: With Angular Universal support

### Environment Configuration

The app supports multiple environments:

- **Development**: `VITE_USE_MOCKS=true` for local development
- **Production**: `VITE_USE_MOCKS=false` for real API calls
- **Testing**: Isolated test environment with mock services

### Adding New Features

1. **Define Contracts**: Add interfaces to `contracts.ts`
2. **Create Services**: Implement business logic in services
3. **Add UI Components**: Create standalone Angular components
4. **Update Stores**: Add state management as needed
5. **Test Integration**: Use the API test button to validate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow Angular style guide
- Use TypeScript strict mode
- Write comprehensive tests
- Document complex algorithms
- Maintain clean commit history

## 📋 Roadmap

### ✅ Completed Features
- ✅ **Modern Glassmorphism UI**: Complete visual redesign with frosted glass effects
- ✅ **Browser-Based API Management**: Secure localStorage key management with save/load/clear
- ✅ **Full Pipeline Testing**: End-to-end API validation with comprehensive error handling
- ✅ **Real-Time Story Generation**: Streaming story creation with Grok AI integration
- ✅ **Smart Speaker Parsing**: AI-powered character detection and dialogue segmentation
- ✅ **Professional Audio Synthesis**: ElevenLabs integration with multi-voice support
- ✅ **Intelligent Voice Assignment**: AI-powered voice matching with confidence scoring
- ✅ **Narrator Voice System**: Dedicated narrator voice with smart recommendations
- ✅ **Responsive Design**: Mobile-first approach with cross-device compatibility
- ✅ **TypeScript Error Resolution**: All compilation errors fixed for stable builds
- ✅ **Multi-Platform Deployment**: Vercel and GitHub Pages support
- [x] Smart voice assignment with AI analysis
- [x] Real-time story generation streaming
- [x] Professional voice synthesis
- [x] Modern UI with theme support
- [x] Comprehensive error handling
- [x] API integration testing
- [x] **Narrator voice separation with AI recommendations**
- [x] **Smart narrator voice selection based on story content**

### 🔄 In Progress
- [ ] Emotion-based voice modulation
- [ ] Story library and persistence
- [ ] Advanced customization options

### 🎯 Future Enhancements
- [ ] Multi-language support
- [ ] Voice cloning capabilities
- [ ] Collaborative storytelling
- [ ] Mobile app version
- [ ] Plugin system for custom voices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **xAI** for the Grok API
- **ElevenLabs** for professional voice synthesis
- **Angular Team** for the excellent framework
- **Open Source Community** for inspiration and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Phazzie/SpicyFairytales/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Phazzie/SpicyFairytales/discussions)
- **Documentation**: See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) and [PRD.md](PRD.md)

---

**Made with ❤️ using Angular 20, RxJS, and cutting-edge AI**