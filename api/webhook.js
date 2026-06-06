// api/webhook.js
// Receives incoming WhatsApp messages from patients (confirm / reschedule)

export default async function handler(req, res) {
  // Webhook verification (Meta requires GET with hub.challenge)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Incoming message handler
  if (req.method === 'POST') {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      const changes = body.entry?.[0]?.changes?.[0]?.value;
      const messages = changes?.messages;
      if (messages?.length) {
        const msg = messages[0];
        const from = msg.from;
        const text = msg.text?.body?.toLowerCase() || '';
        console.log(`Message from ${from}: ${text}`);

        // Auto-reply logic
        let reply = '';
        if (text.includes('confirm') || text.includes('yes') || text.includes('ndio')) {
          reply = `✅ Thank you! Your appointment has been confirmed. We look forward to seeing you. Reply HELP if you need anything.`;
        } else if (text.includes('reschedule') || text.includes('cancel') || text.includes('postpone')) {
          reply = `📅 No problem! To reschedule, please call us at the clinic or reply with your preferred date and time. We'll confirm within 30 minutes.`;
        } else if (text.includes('help') || text.includes('info')) {
          reply = `🏥 CareLink Patient Support\n\nReply:\n• CONFIRM — to confirm your appointment\n• RESCHEDULE — to change your appointment\n• HELP — to reach us\n\nNairobi Central Clinic: +254 700 000 000`;
        } else {
          reply = `Hi! This is CareLink automated support. Reply CONFIRM to confirm your appointment, RESCHEDULE to change it, or HELP to reach our team.`;
        }

        // Send auto-reply
        const waToken = process.env.WHATSAPP_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        if (waToken && phoneId) {
          await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${waToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: from,
              type: 'text',
              text: { body: reply }
            })
          });
        }
      }
    }
    return res.status(200).json({ status: 'ok' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
