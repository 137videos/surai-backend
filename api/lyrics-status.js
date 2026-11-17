// api/lyrics-status.js
// Checks a Suno lyrics generation task's status and returns the generated lyrics.

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
      `https://api.sunoapi.org/api/v1/lyrics/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: { Authorization: `Bearer ${process.env.SUNOAPI_KEY}` },
      }
    );

    const data = await response.json();

    if (!response.ok || data.code !== 200) {
      return res.status(502).json({ error: data.msg || 'SunoAPI ne error diya', raw: data });
    }

    return res.status(200).json(data.data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
