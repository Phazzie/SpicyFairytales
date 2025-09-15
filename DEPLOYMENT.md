# Deployment Configuration

This document explains how the application is configured for deployment on Vercel and GitHub Pages to handle client-side routing properly.

## Problem

Single Page Applications (SPAs) with client-side routing encounter 404 errors when users navigate directly to routes that don't have corresponding static files. When a user visits `/generate` directly, the server returns a 404 because there's no physical file at that path.

## Solution

### Vercel Deployment

**Configuration File:** `vercel.json`

- **Rewrites:** All requests are rewritten to serve `index.html`
- **Build Command:** Uses the `production-spa` configuration for client-only builds
- **Output Directory:** Points to the browser build output (`dist/spicy-fairytales/browser`)

Key settings:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### GitHub Pages Deployment

**Configuration Files:**
- `.nojekyll` - Disables Jekyll processing
- `404.html` - Custom 404 page that redirects to the app

The `404.html` file handles routing by redirecting all 404s to the main application, which then uses Angular's router to handle the route client-side.

### Angular Configuration

**Build Configuration:** `angular.json`

Added a `production-spa` configuration that:
- Disables SSR (`"ssr": false`)
- Disables server generation (`"server": false`) 
- Uses static output mode (`"outputMode": "static"`)
- Generates only browser bundles

## Routes

The application has two routes:
- `/` - Redirects to `/generate`
- `/generate` - Main story generation page

Both routes work correctly with the fallback configuration.

## Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) supports deploying to:
- **Vercel** - Primary deployment platform
- **GitHub Pages** - Alternative deployment platform
- **Both** - Deploy to both platforms simultaneously

The workflow uses the `production-spa` build configuration for all deployments.

## Testing

To test the routing locally:
1. Build the application: `npm run build -- --configuration production-spa`
2. Serve the dist folder with a static server that supports fallback routing
3. Navigate to `/generate` directly - should load the application correctly

## Files Modified

- `vercel.json` - Vercel deployment configuration
- `angular.json` - Added production-spa build configuration
- `public/.nojekyll` - GitHub Pages Jekyll bypass
- `public/404.html` - GitHub Pages 404 fallback
- `.github/workflows/deploy.yml` - Updated deployment workflow