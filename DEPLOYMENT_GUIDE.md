# SpicyFairytales Deployment Guide

## Overview
This guide covers the complete deployment setup for SpicyFairytales, a modern Angular 20 application with SSR (Server-Side Rendering) deployed on Vercel.

## Architecture

### Technology Stack
- **Frontend**: Angular 20 with standalone components and signals
- **Backend/API**: Grok AI (x.ai) for story generation and speaker parsing
- **Voice Synthesis**: ElevenLabs for text-to-speech
- **Deployment**: Vercel with Node.js 20 runtime
- **SSR**: Angular Universal for server-side rendering

### Data Pipeline
```
StoryOptions → [StoryService] → Raw Story (string) 
  → [SpeakerParser] → ParsedStory (JSON) 
  → [VoiceService] → AudioChunks
```

## Deployment Configurations

### 1. Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "name": "spicy-fairytales",
  "buildCommand": "cd spicy-fairytales && npm run build",
  "outputDirectory": "spicy-fairytales/dist/spicy-fairytales/browser",
  "installCommand": "cd spicy-fairytales && npm ci",
  "framework": null,
  "functions": {
    "spicy-fairytales/dist/spicy-fairytales/server/server.mjs": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### 2. Environment Variables

#### Required for Production:
- `VITE_GROK_API_KEY`: API key from x.ai console
- `VITE_ELEVENLABS_API_KEY`: API key from ElevenLabs
- `NODE_ENV`: Set to "production"
- `VITE_USE_MOCKS`: Set to "false" for real APIs

#### Development:
- `VITE_USE_MOCKS`: Set to "true" to use mock services

### 3. GitHub Actions Workflows

#### Vercel Deployment (`.github/workflows/vercel.yml`)
- **Production**: Triggered on push to main branch
- **Preview**: Manual trigger for staging environments
- **Features**: Automatic deployment, environment management, build caching

#### CI/CD Pipeline (`.github/workflows/ci-cd.yml`)
- **Testing**: Runs on PR and push events
- **Building**: Production build validation
- **Deployment**: Preview deployments for PRs

## Performance Optimizations

### Bundle Analysis
- **Initial Bundle**: ~454 KB (121 KB gzipped)
- **Server Bundle**: ~1.3 MB (optimized for SSR)
- **Lazy Loading**: Implemented for xhr2 modules

### Caching Strategy
- **Static Assets**: 1 year cache with immutable flag
- **HTML/JSON**: 1 hour cache with revalidation
- **API Responses**: Handled by service-specific caching

### Security Headers
- Content Security Policy (CSP)
- XSS Protection
- Frame Options (DENY)
- Content Type Options (nosniff)
- Permissions Policy

## Error Handling & Monitoring

### Global Error Handler
- Centralized error processing
- User-friendly error messages
- Development vs production error handling
- Automatic error reporting (ready for monitoring services)

### Error Boundary Components
- Component-level error isolation
- Graceful degradation
- Retry mechanisms
- User guidance for recovery

### Toast Notification System
- Real-time user feedback
- Error categorization
- Auto-dismissal and manual controls
- Accessibility support

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured in Vercel
- [ ] API keys validated and functional
- [ ] Build passes locally (`npm run build`)
- [ ] Tests pass (`npm run test:ci`)
- [ ] Environment validation (`npm run validate`)

### Deployment Steps
1. **Push to main branch** (triggers automatic deployment)
2. **Monitor build logs** in Vercel dashboard
3. **Verify deployment** at production URL
4. **Test full API pipeline** (story generation → parsing → synthesis)
5. **Validate performance** (Core Web Vitals)

### Post-Deployment
- [ ] Functional testing of all features
- [ ] Performance monitoring
- [ ] Error tracking setup
- [ ] SEO validation (meta tags, SSR content)

## Monitoring & Maintenance

### Performance Metrics
- First Contentful Paint (FCP): Target < 1.5s
- Largest Contentful Paint (LCP): Target < 2.5s
- Cumulative Layout Shift (CLS): Target < 0.1
- First Input Delay (FID): Target < 100ms

### Error Monitoring
- Implement error tracking service (Sentry, LogRocket)
- Monitor API rate limits and failures
- Track user engagement and conversion
- Monitor bundle size growth

### Maintenance Tasks
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance audits and optimization
- **As needed**: Feature updates and bug fixes

## API Integration

### Grok API (x.ai)
- **Purpose**: Story generation and speaker parsing
- **Rate Limits**: Monitor usage to avoid throttling
- **Error Handling**: Automatic retries and fallback messages
- **Model**: grok-4-0709 (optimized for creative writing)

### ElevenLabs API
- **Purpose**: Text-to-speech synthesis
- **Voice Management**: Pre-selected voice library
- **Streaming**: Real-time audio chunk generation
- **Error Handling**: Graceful degradation for voice failures

## Security Considerations

### API Key Protection
- Environment variable isolation
- No client-side exposure
- Secure transmission via HTTPS
- Regular key rotation (recommended)

### Content Security
- Input sanitization for user-generated content
- XSS protection via framework defaults
- CSRF protection via Angular built-ins
- Content type validation

### Data Privacy
- No persistent storage of user data
- Client-side audio processing
- Minimal data collection
- GDPR compliance considerations

## Troubleshooting

### Common Issues

#### Build Failures
- **Symptom**: Build fails with TypeScript errors
- **Solution**: Check environment variable types and imports
- **Prevention**: Regular dependency updates

#### API Failures
- **Symptom**: Story generation or synthesis fails
- **Solution**: Verify API keys and rate limits
- **Prevention**: Implement proper error boundaries

#### Performance Issues
- **Symptom**: Slow loading or poor Core Web Vitals
- **Solution**: Bundle analysis and code splitting
- **Prevention**: Regular performance audits

### Support Resources
- Angular documentation: https://angular.dev
- Vercel deployment docs: https://vercel.com/docs
- x.ai API documentation: https://docs.x.ai
- ElevenLabs API docs: https://elevenlabs.io/docs