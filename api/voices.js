/**
 * Vercel Serverless Function: ElevenLabs Voice List API Proxy
 * 
 * Securely proxies voice listing requests to ElevenLabs API.
 * Returns available voices for character voice assignment in the UI.
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY not configured');
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured on server' });
    }

    // Call ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.statusText}` 
      });
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error('List voices proxy failed:', error);
    return res.status(500).json({ 
      error: `Listing voices failed: ${error.message || 'Unknown error'}` 
    });
  }
}
