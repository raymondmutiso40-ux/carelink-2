// api/gemini.js
// Serverless proxy — keeps your Gemini API key safe on the server

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY || req.body.apiKey;
  if (!apiKey) return res.status(400).json({ error: 'No Gemini API key provided' });

  const { prompt, maxTokens = 1200 } = req.body;

  try {
    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens }
        })
      }
    );
    const data = await gemRes.json();
    if (!gemRes.ok) return res.status(gemRes.status).json({ error: data.error?.message });
    return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
