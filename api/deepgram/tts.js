// Deepgram Text-to-Speech API Endpoint
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
    const { text, model = 'aura-2-odysseus-en' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Deepgram TTS API endpoint
    const deepgramTTSUrl = `https://api.deepgram.com/v1/speak?model=${model}`;

    const response = await axios.post(
      deepgramTTSUrl,
      { text },
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Return audio data
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
    return res.status(200).send(response.data);

  } catch (error) {
    console.error('Deepgram TTS error:', error);
    return res.status(500).json({
      error: 'Text-to-Speech failed',
      details: error.message
    });
  }
}