/**
 * @fileoverview Server-specific application routes.
 *
 * ## Architecture Context
 * This file defines the routes for the server-side rendering (SSR) environment.
 * While it currently re-exports the client-side routes, it provides a seam
 * where server-specific routes or guards could be added in the future.
 *
 * ## Information Flow
 * 1. The server-side application configuration (`app.config.server.ts`) imports
 *    these routes.
 * 2. The Angular router uses this configuration when rendering the application
 *    on the server.
 *
 * ## Contract Compliance
 * - The `routes` array conforms to the `Routes` type from `@angular/router`.
 * - It maintains a clean separation between server and client routing configurations.
 */

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
