// api/callback.js
// SunoAPI requires a callBackUrl, but we don't actually use webhook notifications —
// the frontend polls /api/status instead. This just acknowledges Suno's ping so it doesn't retry/error.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ received: true });
}
