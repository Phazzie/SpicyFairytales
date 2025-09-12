/**
 * ## Architecture Context
 * Server-side rendering routes configuration for Angular SSR.
 *
 * ## Contract Compliance
 * - The `serverRoutes` array conforms to the `ServerRoute` type from `@angular/ssr`.
 * - It maintains a clean separation between server and client routing configurations.
 */

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
