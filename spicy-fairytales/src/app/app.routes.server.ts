/**
 * Server-side routing configuration for Angular Universal SSR and static prerendering.
 * 
 * Defines server-specific route handling for search engine optimization and initial
 * page load performance. Configures prerendering strategy for static content generation
 * while maintaining compatibility with client-side routing and dynamic content.
 * 
 * INPUT: Route patterns, rendering mode specifications, SSR configuration
 * OUTPUT: Server route configuration, prerendering instructions, SSR behavior
 * DEPENDENCIES: Angular Universal SSR, server rendering infrastructure
 * INTEGRATIONS: Used by app.config.server.ts, works with main route configuration
 * FEATURES: Static prerendering, SEO optimization, fast initial page loads
 * PERFORMANCE: Generates static HTML for search engines and social media crawlers
 */
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
