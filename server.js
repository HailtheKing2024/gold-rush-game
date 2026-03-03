const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

app.get('/api/leaderboard', async (req, res) => {
  console.log('[GET] /api/leaderboard called');
  try {
    if (!redisUrl || !redisToken) {
      console.log('Error: Redis creds missing');
      return res.status(500).json({ error: 'Redis config missing' });
    }
    console.log('Fetching from Redis...');
    const r = await fetch(redisUrl + '/get/leaderboard_scores', {
      headers: { Authorization: 'Bearer ' + redisToken },
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
    console.log('Returning', s.length, 'scores');
    res.json(s);
  } catch (err) {
    console.error('Get error:', err);
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/leaderboard', async (req, res) => {
  console.log('[POST] /api/leaderboard received');
  console.log('Body:', req.body);
  try {
    if (!redisUrl || !redisToken) {
      console.log('Error: Redis creds missing');
      return res.status(500).json({ error: 'Redis config missing' });
    }
    const { name, score } = req.body;
    console.log('Name:', name, 'Score:', score);
    if (!name || typeof name !== 'string' || typeof score !== 'number') {
      console.log('Error: Bad input');
      return res.status(400).json({ error: 'Bad input' });
    }

    // Get current scores
    const r1 = await fetch(redisUrl + '/get/leaderboard_scores', {
      headers: { Authorization: 'Bearer ' + redisToken },
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

    // Add new score
    s.push({ name, score, timestamp: Date.now() });
    console.log('Saving', s.length, 'scores');

    // Save back
    const r2 = await fetch(redisUrl + '/set/leaderboard_scores', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + redisToken },
      body: JSON.stringify(s),
    });

    if (r2.ok) {
      console.log('Success: Saved to Redis');
      res.status(201).json({ ok: true });
    } else {
      console.log('Error: Redis save failed');
      res.status(500).json({ error: 'Save failed' });
    }
  } catch (err) {
    console.error('Catch error:', err);
    res.status(500).json({ error: 'Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gold Rush server running on port ${port}`);
});
