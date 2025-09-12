/**
 * Server-side rendering configuration extending the base application config for Angular Universal.
 * 
 * SSR-specific configuration that enables server-side pre-rendering for improved SEO,
 * initial page load performance, and social media compatibility. Merges server-specific
 * providers with the base application configuration while maintaining service abstractions.
 * 
 * INPUT: Base application config, server-specific routes, SSR providers
 * OUTPUT: Complete SSR-enabled application configuration
 * DEPENDENCIES: Angular Universal SSR, base app.config, server routing configuration
 * INTEGRATIONS: Used by server.ts for SSR bootstrap, extends client-side configuration
 * FEATURES: Server-side pre-rendering, SEO optimization, improved initial load performance
 * ARCHITECTURE: Maintains service abstraction pattern for SSR compatibility
 */
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
