const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'leaderboard.json');

function loadScores() {
    try {
        const text = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(text);
    } catch (e) {
        return [];
    }
}

function saveScores(scores) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2), 'utf8');
}

app.get('/api/leaderboard', (req, res) => {
    const scores = loadScores();
    res.json(scores);
});

app.post('/api/leaderboard', (req, res) => {
    const { name, score } = req.body;
    if (typeof name !== 'string' || typeof score !== 'number') {
        return res.status(400).json({ error: 'invalid payload' });
    }
    const scores = loadScores();
    scores.push({ name, score, timestamp: Date.now() });
    saveScores(scores);
    res.status(201).json({ ok: true });
});

// serve static site
app.use(express.static(path.join(__dirname)));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Gold Rush server listening on port ${port}`);
});
