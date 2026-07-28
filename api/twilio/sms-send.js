// Twilio SMS Send API Endpoint
const twilio = require('twilio');

module.exports = async (req, res) => {
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
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'To phone number and message are required' });
    }

    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send SMS message
    const smsMessage = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
      body: message
    });

    return res.status(200).json({
      success: true,
      messageId: smsMessage.sid,
      status: smsMessage.status,
      to: smsMessage.to,
      from: smsMessage.from
    });

  } catch (error) {
    console.error('Twilio SMS error:', error?.message || error);
    return res.status(500).json({
      error: 'Failed to send SMS message',
      details: error?.message || 'Unknown error'
    });
  }
};
