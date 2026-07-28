// Twilio WhatsApp Send API Endpoint
const twilio = require('twilio');

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
    const { to, message, mediaUrl } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'To phone number and message are required' });
    }

    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send WhatsApp message
    const whatsappMessage = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      body: message,
      mediaUrl: mediaUrl || undefined
    });

    return res.status(200).json({
      success: true,
      messageId: whatsappMessage.sid,
      status: whatsappMessage.status,
      to: whatsappMessage.to,
      from: whatsappMessage.from
    });

  } catch (error) {
    console.error('Twilio WhatsApp error:', error);
    return res.status(500).json({
      error: 'Failed to send WhatsApp message',
      details: error.message
    });
  }
}