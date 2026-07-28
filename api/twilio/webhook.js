// Twilio WhatsApp Webhook Endpoint
// This endpoint receives incoming WhatsApp messages from the Twilio Sandbox.
// Configure this URL in the Twilio Console Sandbox "When a message comes in" field:
//   https://ajinashop-luxury.vercel.app/api/twilio/webhook
//
// Twilio Sandbox details:
//   WhatsApp number: whatsapp:+14155238886
//   Join code: "join they-shaking"
//   Sandbox participant: whatsapp:+491627785014

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract incoming message details from Twilio's request body
    const from = req.body?.From || '';
    const to = req.body?.To || '';
    const body = req.body?.Body || '';
    const profileName = req.body?.ProfileName || '';
    const messageSid = req.body?.MessageSid || '';

    console.log('Incoming WhatsApp message:', {
      from,
      to,
      body,
      profileName,
      messageSid
    });

    // Auto-reply with TwiML (TwiML is what Twilio expects back to send a reply)
    const greeting = profileName ? `Hello ${profileName}!` : 'Hello!';
    const replyText = `${greeting} Welcome to AJINASHOP Luxury Beauty. Our team will get back to you shortly. In the meantime, feel free to browse our collection at https://ajinashop-luxury.vercel.app`;

    // Return TwiML response so Twilio replies automatically
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(replyText)}</Message>
</Response>`);
  } catch (error) {
    console.error('Twilio webhook error:', error?.message || error);
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your message. We will get back to you shortly.</Message>
</Response>`);
  }
};

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
