// api/lyrics.js
// Starts a Suno lyrics generation task (AI writes the song's words for you).

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

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'prompt zaroori hai' });
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const callBackUrl = `${proto}://${req.headers.host}/api/callback`;

  try {
    const response = await fetch('https://api.sunoapi.org/api/v1/lyrics', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUNOAPI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: String(prompt).slice(0, 200),
        callBackUrl,
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
