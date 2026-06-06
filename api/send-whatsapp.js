// api/send-whatsapp.js
// Vercel serverless function — sends WhatsApp messages via Meta Business Cloud API

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, message, patientName } = req.body;
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    return res.status(500).json({
      error: 'WhatsApp not configured',
      hint: 'Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID in Vercel environment variables'
    });
  }

  // Sanitize phone — ensure format is 2547XXXXXXXX (no + or spaces)
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  try {
    const waRes = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message }
        })
      }
    );

    const data = await waRes.json();
    if (!waRes.ok) {
      return res.status(waRes.status).json({ error: data.error?.message || 'WhatsApp API error', detail: data });
    }

    return res.status(200).json({
      success: true,
      messageId: data.messages?.[0]?.id,
      to: cleanPhone,
      patient: patientName
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
