# Vercel Deployment Guide for Spicy FairyTales

## Environment Variables Setup

The application requires API keys to be configured in Vercel for the deployed version to work.

### Required Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

1. **XAI_API_KEY** (Required)
   - Your x.ai Grok API key
   - Get it from: https://console.x.ai/
   - Used for: Story generation with AI
   - Environment: Production, Preview, Development

2. **ELEVENLABS_API_KEY** (Required)
   - Your ElevenLabs API key
   - Get it from: https://elevenlabs.io/
   - Used for: Text-to-speech voice synthesis
   - Environment: Production, Preview, Development

### Optional Environment Variables

3. **XAI_TIMEOUT_MS** (Optional, default: 120000)
   - Timeout for Grok API requests in milliseconds
   - Recommended: 120000 (2 minutes)

4. **ELEVENLABS_TIMEOUT_MS** (Optional, default: 120000)
   - Timeout for ElevenLabs API requests in milliseconds
   - Recommended: 120000 (2 minutes)

5. **ELEVENLABS_MODEL_ID** (Optional, default: eleven_monolingual_v1)
   - ElevenLabs voice model to use
   - Options: eleven_monolingual_v1, eleven_multilingual_v2

## How to Add Environment Variables in Vercel

### Via Vercel Dashboard (Web UI)

1. Go to your project on Vercel: https://vercel.com/dashboard
2. Click on your **SpicyFairytales** project
3. Navigate to **Settings** tab
4. Click **Environment Variables** in the sidebar
5. For each variable:
   - Enter the **Key** (e.g., `XAI_API_KEY`)
   - Enter the **Value** (your actual API key)
   - Select environments: **Production**, **Preview**, and **Development**
   - Click **Save**

### Via Vercel CLI (Command Line)

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (run from project root)
cd spicy-fairytales
vercel link

# Add environment variables
vercel env add XAI_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development

vercel env add ELEVENLABS_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development
```

## Deployment Process

### Automatic Deployment (Recommended)

Every push to the `main` branch automatically triggers a deployment to Vercel.

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Manual Deployment via CLI

```bash
cd spicy-fairytales
vercel --prod
```

## Verifying Deployment

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Check the build logs for errors

2. **Test API Endpoints**
   - Once deployed, test the API endpoints:
   - `https://your-domain.vercel.app/api/voices` (should return voice list)
   - Story generation and speech synthesis are tested through the UI

3. **Test the Application**
   - Visit: https://spicy-fairytales.vercel.app
   - Try generating a story
   - Verify voice synthesis works

## Troubleshooting

### "API Key not configured" Error

**Problem**: Application shows "XAI_API_KEY not configured on server" or similar error.

**Solution**:
1. Verify environment variables are set in Vercel Dashboard
2. Make sure you selected all environments (Production, Preview, Development)
3. Redeploy the application after adding variables
4. Check that variable names match exactly (no VITE_ prefix for server variables)

### Build Fails

**Problem**: Deployment fails during build.

**Solution**:
1. Check build logs in Vercel Dashboard
2. Verify `package.json` dependencies are correct
3. Ensure `angular.json` has correct configuration
4. Try building locally: `npm run build:vercel`

### API Endpoints Return 404

**Problem**: `/api/*` endpoints return 404 Not Found.

**Solution**:
1. Verify `api/` folder exists in your repository
2. Check `vercel.json` has correct routing configuration
3. Ensure serverless functions are valid JavaScript/TypeScript
4. Check Vercel deployment logs for function deployment errors

### Stories Not Generating

**Problem**: Story generation starts but fails or times out.

**Solution**:
1. Check XAI_API_KEY is valid and has credits
2. Verify XAI_TIMEOUT_MS is set high enough (120000ms recommended)
3. Check browser console for specific error messages
4. Try with a shorter story length

### Voice Synthesis Not Working

**Problem**: Audio doesn't play or synthesis fails.

**Solution**:
1. Check ELEVENLABS_API_KEY is valid and has credits
2. Verify voice IDs are correct (test with `/api/voices`)
3. Check browser console for errors
4. Try with shorter text segments

## Architecture Notes

### Static Deployment + Serverless Functions

The application uses:
- **Static Angular build** for the frontend (SPA)
- **Vercel Serverless Functions** for API proxying (`/api/*` routes)

This architecture:
- ✅ Avoids exposing API keys in the browser
- ✅ Handles streaming responses for story generation
- ✅ Enables secure server-side API communication
- ✅ Works with Vercel's edge network for fast global delivery

### API Proxy Pattern

All external API calls (Grok, ElevenLabs) go through serverless functions:
1. Frontend calls `/api/generate-story` or `/api/synthesize-speech`
2. Vercel serverless function receives request
3. Function adds API key from environment variables
4. Function proxies request to external API
5. Function streams response back to frontend

This keeps API keys secure on the server side.

## Development vs Production

### Local Development (.env file)

For local development, use `.env` file with `VITE_USE_MOCKS=true`:

```env
VITE_USE_MOCKS=true
VITE_XAI_API_KEY=your_key_here
VITE_ELEVENLABS_API_KEY=your_key_here
```

### Production Deployment (Vercel Environment Variables)

For production, set environment variables in Vercel Dashboard (without VITE_ prefix):

```
XAI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
```

The server-side API functions use these non-VITE prefixed variables.

## Security Best Practices

1. **Never commit API keys** to the repository
2. **Use environment variables** for all sensitive configuration
3. **Rotate API keys** regularly
4. **Monitor API usage** through provider dashboards
5. **Set up usage alerts** to prevent unexpected charges
6. **Use serverless functions** to keep keys server-side

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [x.ai API Documentation](https://docs.x.ai/)
- [ElevenLabs API Documentation](https://docs.elevenlabs.io/)
