// Deepgram Transcription API Endpoint
// Handles both raw audio blob (Content-Type: audio/webm) and JSON { audioData }
const axios = require('axios');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let audioBuffer;
    let contentType = 'audio/webm';

    // Case 1: Raw audio blob sent directly as the body (from MediaRecorder)
    // When the Content-Type is not JSON, req.body is the raw buffer
    if (req.body && Buffer.isBuffer(req.body)) {
      audioBuffer = req.body;
    }
    // Case 2: JSON body with audioData field
    else if (req.body && req.body.audioData) {
      audioBuffer = req.body.audioData;
    }
    // Case 3: Raw body as a string or other format
    else if (req.body && typeof req.body === 'string') {
      audioBuffer = Buffer.from(req.body, 'binary');
    }

    if (!audioBuffer || audioBuffer.length < 100) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const model = (req.query.model) || 'nova-3';
    const language = (req.query.language) || 'en';

    // Deepgram API endpoint
    const deepgramUrl = `https://api.deepgram.com/v1/listen?model=${model}&language=${language}&smart_format=true&utterances=true`;

    const response = await axios.post(
      deepgramUrl,
      audioBuffer,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': contentType
        }
      }
    );

    return res.status(200).json({
      success: true,
      transcript: response.data.results?.channels[0]?.alternatives[0]?.transcript || '',
      confidence: response.data.results?.channels[0]?.alternatives[0]?.confidence || 0,
      words: response.data.results?.channels[0]?.alternatives[0]?.words || []
    });

  } catch (error) {
    console.error('Deepgram transcription error:', error);
    return res.status(500).json({
      error: 'Transcription failed',
      details: error.message
    });
  }
}
