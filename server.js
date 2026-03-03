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
  try {
    if (!redisUrl || !redisToken) {
      return res.status(500).json({ error: 'Redis config missing' });
    }
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
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/leaderboard', async (req, res) => {
  try {
    if (!redisUrl || !redisToken) {
      return res.status(500).json({ error: 'Redis config missing' });
    }
    const { name, score } = req.body;
    if (!name || typeof name !== 'string' || typeof score !== 'number') {
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

    // Save back
    const r2 = await fetch(redisUrl + '/set/leaderboard_scores', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + redisToken },
      body: JSON.stringify(s),
    });

    if (r2.ok) {
      res.status(201).json({ ok: true });
    } else {
      res.status(500).json({ error: 'Save failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gold Rush server running on port ${port}`);
});
