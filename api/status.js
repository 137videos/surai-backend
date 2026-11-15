// api/status.js
// Vercel Serverless Function — checks a Suno generation task's status.
// Frontend polls this every few seconds until the song is ready.

export default async function handler(req, res) {
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
