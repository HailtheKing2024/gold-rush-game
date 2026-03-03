export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    res.status(500).json({ error: 'Config missing' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const r = await fetch(url + '/get/leaderboard_scores', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const d = await r.json();
      let s = [];
      if (d && d.result) {
        try {
          s = JSON.parse(d.result);
          if (!Array.isArray(s)) s = [];
        } catch {
          s = [];
        }
      }
      res.json(s);
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const name = body.name;
      const score = body.score;

      if (!name || typeof name !== 'string' || typeof score !== 'number') {
        res.status(400).json({ error: 'Bad input' });
        return;
      }

      const r1 = await fetch(url + '/get/leaderboard_scores', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const d1 = await r1.json();
      let s = [];
      if (d1 && d1.result) {
        try {
          s = JSON.parse(d1.result);
          if (!Array.isArray(s)) s = [];
        } catch {
          s = [];
        }
      }

      s.push({ name: name, score: score, timestamp: Date.now() });

      const r2 = await fetch(url + '/set/leaderboard_scores', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify(s),
      });

      if (r2.ok) {
        res.status(201).json({ ok: true });
      } else {
        res.status(500).json({ error: 'Save failed' });
      }
      return;
    }

    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error' });
  }
}
