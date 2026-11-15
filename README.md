# surai-backend
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
        model: 'V4_5',
      }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== 200) {
      return res.status(502).json({ error: data.msg || 'SunoAPI ne error diya', raw: data });
    }

    // taskId ko frontend ko wapas bhejo — status poll karne ke liye isi ki zaroorat hai
    return res.status(200).json({ taskId: data.data.taskId });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}

// api/status.js
// Vercel Serverless Function — checks a Suno generation task's status.
// Frontend polls this every few seconds until the song is ready.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { taskId } = req.query;

  if (!taskId) {
    return res.status(400).json({ error: 'taskId zaroori hai' });
  }

  try {
    const response = await fetch(
      `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUNOAPI_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.code !== 200) {
      return res.status(502).json({ error: data.msg || 'SunoAPI ne error diya', raw: data });
    }

    // data.data mein status ("PENDING" / "SUCCESS" / etc.) aur, complete hone par, audio track details milte hain
    return res.status(200).json(data.data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
