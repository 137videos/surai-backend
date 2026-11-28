// api/polish-lyrics.js
// Uses the Claude API (Anthropic) to improve user-written lyrics:
// better grammar, rhyme, and emotional impact, same theme/meaning.
// The ANTHROPIC_API_KEY stays here on the server and never reaches the browser.

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

  const { lyrics } = req.body || {};
  if (!lyrics || !lyrics.trim()) {
    return res.status(400).json({ error: 'lyrics zaroori hain' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        system:
          'You polish song lyrics (Hindi, English, or Hinglish). Keep the same language, theme and meaning the user wrote. Improve grammar, rhyme/rhythm, and emotional impact. Return ONLY the improved lyrics text, with no preamble, no explanation, no quotes around it.',
        messages: [{ role: 'user', content: String(lyrics).slice(0, 3000) }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: data.error?.message || 'Claude API ne error diya' });
    }

    const polished = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!polished) {
      return res.status(502).json({ error: 'Koi jawab nahi mila' });
    }

    return res.status(200).json({ polished });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
