/**
 * Vercel Serverless Function: ElevenLabs Speech Synthesis API Proxy
 * 
 * Securely proxies text-to-speech requests to ElevenLabs API.
 * Handles authentication, error management, and audio streaming for character voice synthesis.
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voiceId } = req.body;

    // Validate inputs
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid text: must be a non-empty string' });
    }
    if (!voiceId || typeof voiceId !== 'string' || voiceId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid voiceId: must be a non-empty string' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY not configured');
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured on server' });
    }

    // Set up timeout
    const controller = new AbortController();
    const timeoutMs = Number(process.env.ELEVENLABS_TIMEOUT_MS ?? 120000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.statusText}` 
      });
    }

    // Set audio headers and stream the response
    res.setHeader('Content-Type', 'audio/mpeg');
    
    if (response.body) {
      const reader = response.body.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
      } catch (error) {
        console.error('Error streaming audio:', error);
      } finally {
        reader.releaseLock();
        res.end();
      }
    } else {
      return res.status(500).json({ error: 'No audio stream received from ElevenLabs API' });
    }

  } catch (error) {
    console.error('Speech synthesis proxy failed:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: `Speech synthesis failed: ${error.message || 'Unknown error'}` 
      });
    }
  }
}
