const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const { nanoid } = require('nanoid'); // npm install nanoid

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const LEADERBOARD_KEY = 'leaderboard_scores';
const MAX_ENTRIES = 10;

// Helper to get all scores
async function getScores() {
  const r = await fetch(redisUrl + '/get/' + LEADERBOARD_KEY, {
    headers: { Authorization: 'Bearer ' + redisToken },
  });
  const d = await r.json();
  if (d && d.result) {
    try {
      const s = JSON.parse(d.result);
      if (Array.isArray(s)) return s;
    } catch {}
  }
  return [];
}

// Helper to save scores
async function saveScores(scores) {
  return await fetch(redisUrl + '/set/' + LEADERBOARD_KEY, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + redisToken },
    body: JSON.stringify(scores),
  });
}

// GET leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (!redisUrl || !redisToken) {
      return res.status(500).json({ error: 'Redis config missing' });
    }

    const scores = await getScores();

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);

    // Return top 10
    res.json(scores.slice(0, MAX_ENTRIES));
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// POST new score
app.post('/api/leaderboard', async (req, res) => {
  try {
    if (!redisUrl || !redisToken) {
      return res.status(500).json({ error: 'Redis config missing' });
    }

    const { name, score } = req.body;

    if (!name || typeof name !== 'string' || typeof score !== 'number') {
      return res.status(400).json({ error: 'Bad input' });
    }

    let scores = await getScores();

    // Add new entry with unique id and timestamp
    scores.push({ id: nanoid(), name, score, timestamp: Date.now() });

    // Sort descending and keep only top 10
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, MAX_ENTRIES);

    // Save updated scores
    const saveResp = await saveScores(scores);
    if (!saveResp.ok) {
      return res.status(500).json({ error: 'Save failed' });
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// DELETE score by id (optional)
app.delete('/api/leaderboard/:id', async (req, res) => {
  try {
    if (!redisUrl || !redisToken) {
      return res.status(500).json({ error: 'Redis config missing' });
    }

    const idToDelete = req.params.id;
    if (!idToDelete) return res.status(400).json({ error: 'ID missing' });

    let scores = await getScores();
    const filtered = scores.filter(entry => entry.id !== idToDelete);

    if (filtered.length === scores.length) {
      return res.status(404).json({ error: 'ID not found' });
    }

    const saveResp = await saveScores(filtered);
    if (!saveResp.ok) {
      return res.status(500).json({ error: 'Save failed' });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gold Rush server running on port ${port}`);
});