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
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline, Readable } from 'node:stream';

// Resolve __dirname in ESM (Node 18/20/22 compatible)
const __dirname = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(__dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * API endpoints to securely proxy requests to external services.
 */
app.use(express.json({ limit: '1mb' })); // Enable JSON body parsing with size cap for API routes

// Proxy for Grok story generation (streaming)
app.post('/api/generate-story', async (req, res) => {
  try {
    const apiKey = process.env['XAI_API_KEY'];
    if (!apiKey) {
      res.status(500).json({ error: 'XAI_API_KEY not configured on server' });
      return;
    }

    // Abort on timeout or when client disconnects
    const controller = new AbortController();
    const timeoutMs = Number(process.env['XAI_TIMEOUT_MS'] ?? 120000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    req.once('close', () => controller.abort());

    const externalApiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });

    if (!externalApiResponse.ok) {
      const errorText = await externalApiResponse.text();
      res.status(externalApiResponse.status).json({ error: `Grok API error: ${externalApiResponse.statusText} - ${errorText}` });
      return;
    }

    // Forward streaming response with proper headers and backpressure
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    (res as any).flushHeaders?.();
    if (externalApiResponse.body) {
      const reader = externalApiResponse.body.getReader();
      try {
        req.once('close', () => reader.cancel().catch(() => {}));
        // Iteratively read and write with backpressure support
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const ok = res.write(Buffer.from(value));
          if (!ok) await new Promise(resolve => res.once('drain', resolve));
        }
      } catch (error) {
        console.error('Error pumping stream:', error);
      } finally {
        res.end();
      }
    } else {
      res.end();
    }
    clearTimeout(timeoutId);
  } catch (error) {
    console.error('Story generation proxy failed:', error);
    res.status(500).json({ error: `Story generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    return;
  }
});

// Proxy for ElevenLabs speech synthesis
app.post('/api/synthesize-speech', async (req, res) => {
    try {
        const { text, voiceId } = req.body as { text?: unknown; voiceId?: unknown };
        if (typeof text !== 'string' || text.trim().length === 0) {
          res.status(400).json({ error: 'Invalid text: must be a non-empty string' });
          return;
        }
        if (typeof voiceId !== 'string' || voiceId.trim().length === 0) {
          res.status(400).json({ error: 'Invalid voiceId: must be a non-empty string' });
          return;
        }

        const apiKey = process.env['ELEVENLABS_API_KEY'];
        if (!apiKey) {
            res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured on server' });
            return;
        }

        const elController = new AbortController();
        const elTimeoutMs = Number(process.env['ELEVENLABS_TIMEOUT_MS'] ?? 120000);
        const elTimeoutId = setTimeout(() => elController.abort(), elTimeoutMs);
        req.once('close', () => elController.abort());

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: process.env['ELEVENLABS_MODEL_ID'] ?? 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                    style: 0.0,
                    use_speaker_boost: true
                }
            }),
            signal: elController.signal,
        });

        if (!response.ok) {
            const errorText = await response.text();
            res.status(response.status).json({ error: `ElevenLabs API error: ${response.statusText} - ${errorText}` });
            return;
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        if (response.body) {
          try {
            // Convert WebReadableStream to Node stream and pipe with backpressure
            const nodeStream = Readable.fromWeb(response.body as any);
            pipeline(nodeStream, res, (err) => {
              if (err) {
                console.error('Streaming audio failed:', err);
                if (!res.headersSent) res.status(500);
                if (!res.writableEnded) res.end();
              }
            });
          } finally {
            clearTimeout(elTimeoutId);
          }
        } else {
          clearTimeout(elTimeoutId);
          res.status(500).json({ error: 'No audio stream received from ElevenLabs API' });
        }
    } catch (error) {
        console.error('Speech synthesis proxy failed:', error);
        res.status(500).json({ error: `Speech synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
        return;
    }
});

// Proxy for listing ElevenLabs voices
app.get('/api/voices', async (req, res) => {
    try {
        const apiKey = process.env['ELEVENLABS_API_KEY'];
        if (!apiKey) {
            res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured on server' });
            return;
        }

        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            res.status(response.status).json({ error: `ElevenLabs API error: ${response.statusText} - ${errorText}` });
            return;
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('List voices proxy failed:', error);
        res.status(500).json({ error: `Listing voices failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
        return;
    }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
const render = (req: any, res: any, next: any) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
};
app.use(render);

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
