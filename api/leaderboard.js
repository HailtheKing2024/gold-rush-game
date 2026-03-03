export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return res.status(500).json({ error: 'Redis credentials not configured' });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${redisUrl}/get/leaderboard_scores`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
      const data = await response.json();
      let scores = [];
      if (data.result) {
        try {
          scores = JSON.parse(data.result);
        } catch {
          scores = [];
        }
      }
      return res.json(scores);
    }

    if (req.method === 'POST') {
      const { name, score } = req.body;

      if (typeof name !== 'string' || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid name or score' });
      }

      // Get current scores
      const getResponse = await fetch(`${redisUrl}/get/leaderboard_scores`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
      const getData = await getResponse.json();
      let scores = [];
      if (getData.result) {
        try {
          scores = JSON.parse(getData.result);
        } catch {
          scores = [];
        }
      }

      // Add new score
      scores.push({ name, score, timestamp: Date.now() });

      // Save back to Redis
      const setResponse = await fetch(`${redisUrl}/set/leaderboard_scores`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${redisToken}` },
        body: JSON.stringify(scores),
      });

      if (!setResponse.ok) {
        throw new Error('Failed to save score');
      }

      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
