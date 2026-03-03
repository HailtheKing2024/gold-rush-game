import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const scores = await redis.get('leaderboard_scores');
      return res.json(scores || []);
    }

    if (req.method === 'POST') {
      const { name, score } = req.body;

      if (typeof name !== 'string' || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid name or score' });
      }

      const scores = await redis.get('leaderboard_scores') || [];
      scores.push({ name, score, timestamp: Date.now() });
      await redis.set('leaderboard_scores', scores);

      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
