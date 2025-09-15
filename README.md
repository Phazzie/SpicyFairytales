# SpicyFairytales 🎭

**AI-Powered Interactive Storytelling Platform**

Transform your ideas into immersive audio stories with AI-generated narratives and professional voice synthesis. Create engaging fairy tales, adventure stories, and custom narratives with intelligent character voice assignment.

![Angular](https://img.shields.io/badge/Angular-20.3.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.0-blue)
![RxJS](https://img.shields.io/badge/RxJS-7.8.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎭 Smart Voice Assignment
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

### 🎨 Modern UI/UX
- **Theme Support**: Light/Dark/Auto themes with system preference detection
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Loading States**: Beautiful skeleton loading and progress indicators
- **Toast Notifications**: Real-time feedback for all user actions

### 🔧 Developer Experience
- **Angular 20**: Latest Angular with standalone components and signals
- **Type Safety**: Full TypeScript with strict type checking
- **Modular Architecture**: Clean separation of concerns with service seams
- **Extensible Design**: Built for easy addition of new features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Phazzie/SpicyFairytales.git
   cd SpicyFairytales/spicy-fairytales
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API keys:
   ```env
   VITE_XAI_API_KEY=your_xai_api_key
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   VITE_USE_MOCKS=false
   ```

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

1. **Fill out the story form**:
   - Choose a genre (fantasy, adventure, mystery, etc.)
   - Set the tone (magical, adventurous, mysterious)
   - Select story length (short, medium, long)
   - Add custom themes and prompts

2. **Generate the story**:
   - Click "Generate Story" to start AI-powered creation
   - Watch the story stream in real-time
   - The system automatically parses speakers and identifies characters

3. **Smart Voice Assignment**:
   - Click "🧠 Smart Assign" for AI-powered voice recommendations
   - Review suggestions with confidence scores and reasoning
   - Accept recommendations or manually adjust voices
   - **Narrator Voice**: Choose a dedicated narrator voice for professional storytelling
   - The system automatically recommends the best narrator voice based on your story's tone and genre

4. **Synthesize Audio**:
   - Click "🔊 Synthesize Audio" to create professional voice audio
   - Listen to your story with character-appropriate voices
   - Export or share your creation

### API Testing

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
npm start          # Start development server
npm run build      # Build for production
npm test           # Run unit tests
npm run validate   # Validate environment setup
npm run test-apis  # Test API integrations
```

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