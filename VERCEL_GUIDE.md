# Vercel CLI Guide 🚀

This document explains how to use the locally installed Vercel CLI for token management and deployment operations.

## Prerequisites

✅ **Vercel CLI is already installed** locally in this project (v48.0.2)
- No global installation needed
- Run via `npx vercel [command]`

## Authentication & Token Management

### Login to Vercel
```bash
# Login to your Vercel account
npx vercel login

# Check current user
npx vercel whoami
```

### Managing Tokens

#### Option 1: Using Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard Settings](https://vercel.com/account/tokens)
2. Create a new token with appropriate scopes
3. Copy the token for use in GitHub Actions secrets

#### Option 2: Using CLI (if logged in)
```bash
# List your teams/orgs (needed for ORG_ID)
npx vercel teams list

# Get project information (needed for PROJECT_ID) 
npx vercel projects list

# Environment variables and secrets
npx vercel env list
npx vercel env add [name]
```

## Current Vercel Configuration

### GitHub Actions Integration
The project uses these Vercel secrets in GitHub Actions:
- `VERCEL_TOKEN` - Authentication token
- `ORG_ID` - Organization/team ID  
- `PROJECT_ID` - Project ID

### Configuration Files
- **`vercel.json`** - Vercel deployment configuration
- **`package.json`** - Build scripts including `build:vercel`

### Build Configuration
```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist/spicy-fairytales/browser",
  "framework": "angular"
}
```

## Deployment Commands

### Manual Deployment
```bash
# Deploy to preview (development)
npx vercel

# Deploy to production
npx vercel --prod

# Deploy with specific configuration
npx vercel --build-env NODE_ENV=production
```

### Development Server
```bash
# Start Vercel development server
npx vercel dev

# Start with custom port
npx vercel dev --listen 3000
```

## Useful Commands

### Project Management
```bash
# Link local project to Vercel project
npx vercel link

# Pull environment variables from Vercel
npx vercel env pull .env.local

# View deployment logs
npx vercel logs [deployment-url]

# List recent deployments
npx vercel ls

# Remove a deployment
npx vercel rm [deployment-url]
```

### Debugging
```bash
# Inspect a deployment
npx vercel inspect [deployment-url]

# View build logs
npx vercel logs [deployment-url] --follow

# Debug mode
npx vercel --debug
```

## Token Setup for GitHub Actions

### Step 1: Get Required IDs
```bash
# After logging in, get your organization ID
npx vercel teams list

# Get your project ID
npx vercel projects list
```

### Step 2: Create Token
1. Go to [Vercel Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a descriptive name (e.g., "GitHub Actions - SpicyFairytales")
4. Select appropriate scope (recommend: Full Account access for CI/CD)
5. Copy the generated token

### Step 3: Add to GitHub Secrets
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN`: The token from step 2
   - `ORG_ID`: From `npx vercel teams list`
   - `PROJECT_ID`: From `npx vercel projects list`

## Current Deployment Strategy

This project uses multiple deployment platforms:

1. **GitHub Pages** (Primary)
   - Automatic deployment on `main` branch
   - Static hosting with SPA support
   - URL: `https://phazzie.github.io/SpicyFairytales/`

2. **Vercel** (Active)
   - Preview deployments on PRs
   - Production deployments on `main` branch
   - Custom domain capability

3. **Netlify** (Removed)
   - ❌ References removed from CI/CD workflows
   - ❌ Not being used despite having workflow configuration

## Troubleshooting

### Common Issues

**"Not logged in"**
```bash
npx vercel login
```

**"Project not linked"**
```bash
npx vercel link
```

**"Build failed"**
```bash
# Check build locally first
npm run build:vercel

# Deploy with debug output
npx vercel --debug
```

**"Permission denied"**
- Check token scopes in Vercel dashboard
- Verify ORG_ID and PROJECT_ID are correct

### Environment Issues
```bash
# Pull latest environment variables
npx vercel env pull

# List current environment variables
npx vercel env list
```

## Security Best Practices

1. **Token Management**
   - Use tokens with minimal required scope
   - Rotate tokens regularly
   - Never commit tokens to version control

2. **Environment Variables**
   - Store sensitive data in Vercel's environment variables
   - Use different values for preview vs. production
   - Never expose API keys in build logs

3. **Project Access**
   - Use team-based permissions when possible
   - Limit deployment permissions to necessary team members
   - Regular audit of access tokens

## Related Documentation

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel GitHub Integration](https://vercel.com/docs/deployments/git/vercel-for-github)
- [Angular on Vercel](https://vercel.com/guides/deploying-angular)