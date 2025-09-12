/**
 * Express.js server providing Angular Universal SSR with static file serving and production hosting.
 * 
 * Production-ready Node.js server that serves the Angular application with server-side rendering
 * capabilities. Handles static asset serving, SSR HTML generation, and API route proxying
 * for optimal performance and SEO in production environments.
 * 
 * INPUT: HTTP requests, static file requests, SSR rendering requests
 * OUTPUT: Server-rendered HTML pages, static assets, API responses, performance-optimized delivery
 * DEPENDENCIES: Express.js, Angular Universal SSR, Node.js platform, static file serving
 * INTEGRATIONS: Hosts the complete application, serves SSR content, handles production deployment
 * FEATURES: Static asset caching, SSR with hydration, production optimization, security headers
 * DEPLOYMENT: Production server for hosting, scaling, and delivering the application to users
 */
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
