// api/generate.js
// Vercel Serverless Function — starts a Suno music generation task.
// The SunoAPI key stays here on the server (as an env var) and never reaches the browser.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  const { title, lyrics, style, voice } = req.body || {};

  if (!title || !lyrics) {
    return res.status(400).json({ error: 'title aur lyrics dono zaroori hain' });
  }

  const instrumental = voice === 'Instrumental Only';

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const callBackUrl = `${proto}://${req.headers.host}/api/callback`;

  try {
    const response = await fetch('https://api.sunoapi.org/api/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUNOAPI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customMode: true,
        instrumental,
        title: String(title).slice(0, 80),
        prompt: lyrics,
        style: style || 'Indian Pop',
        model: 'V4_5',callBackUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== 200) {
      return res.status(502).json({ error: data.msg || 'SunoAPI ne error diya', raw: data });
    }

    return res.status(200).json({ taskId: data.data.taskId });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
