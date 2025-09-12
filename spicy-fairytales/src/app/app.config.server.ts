/**
 * @fileoverview Server-specific application configuration.
 *
 * ## Architecture Context
 * This configuration file extends the base `app.config.ts` with providers
 * necessary for server-side rendering (SSR). It ensures that the application
 * can be rendered on the server before being sent to the client.
 *
 * ## Information Flow
 * 1. The server environment (e.g., `server.ts`) imports `ApplicationConfig` from here.
 * 2. It merges this server-specific configuration with the base application config.
 * 3. The `provideServerRendering()` function enables SSR capabilities.
 *
 * ## Contract Compliance
 * - This file adheres to the Angular `ApplicationConfig` interface.
 * - It does not directly interact with services but provides the necessary
 *   infrastructure for them to run in a server environment.
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
