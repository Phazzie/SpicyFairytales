/**
 * Server-side rendering bootstrap for Angular Universal SSR application initialization.
 * 
 * Server entry point that enables Angular Universal server-side rendering for improved
 * SEO, initial page load performance, and social media compatibility. Bootstraps the
 * application with SSR-specific configuration and providers.
 * 
 * INPUT: SSR bootstrap context, server configuration, Node.js environment
 * OUTPUT: Server-rendered HTML, hydration data, SEO-optimized content
 * DEPENDENCIES: Angular Universal platform-server, SSR configuration, root component
 * INTEGRATIONS: Used by server.ts for SSR, generates pre-rendered HTML for browsers
 * ARCHITECTURE: Server-side rendering with client hydration, maintains application state
 * PERFORMANCE: Enables fast initial page loads, search engine crawling, social media previews
 */
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;
