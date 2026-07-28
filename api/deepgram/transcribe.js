// Deepgram Transcription API Endpoint
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
    const { audioData, model = 'nova-3', language = 'en' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Deepgram API endpoint
    const deepgramUrl = `https://api.deepgram.com/v1/listen?model=${model}&language=${language}&smart_format=true&utterances=true`;

    const response = await axios.post(
      deepgramUrl,
      audioData,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/webm'
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