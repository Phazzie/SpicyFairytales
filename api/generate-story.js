/**
 * Vercel Serverless Function: Grok Story Generation API Proxy
 * 
 * Securely proxies story generation requests to x.ai's Grok API with streaming support.
 * Handles authentication, error management, and streaming Server-Sent Events for real-time story generation.
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      console.error('XAI_API_KEY not configured');
      return res.status(500).json({ error: 'XAI_API_KEY not configured on server' });
    }

    // Validate request body
    if (!req.body || !req.body.messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Set up timeout
    const controller = new AbortController();
    const timeoutMs = Number(process.env.XAI_TIMEOUT_MS ?? 120000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Call Grok API
    const externalApiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!externalApiResponse.ok) {
      const errorText = await externalApiResponse.text();
      console.error(`Grok API error: ${externalApiResponse.status} - ${errorText}`);
      return res.status(externalApiResponse.status).json({ 
        error: `Grok API error: ${externalApiResponse.statusText}` 
      });
    }

    // Set up streaming headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Stream the response
    if (externalApiResponse.body) {
      const reader = externalApiResponse.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } catch (error) {
        console.error('Error streaming response:', error);
      } finally {
        reader.releaseLock();
        res.end();
      }
    } else {
      res.end();
    }

  } catch (error) {
    console.error('Story generation proxy failed:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: `Story generation failed: ${error.message || 'Unknown error'}` 
      });
    }
  }
}
