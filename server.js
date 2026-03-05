import express from "express";
import cors from "cors";
import { createClient } from "redis";
import { nanoid } from "nanoid";

const app = express();
app.use(cors());
app.use(express.json());

const REDIS_URL = process.env.REDIS_URL; // Aiven connection string
const LEADERBOARD_KEY = "leaderboard_scores";
const MAX_ENTRIES = 10;

const client = createClient({ url: REDIS_URL });
await client.connect();

// GET top leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    const top = await client.zRangeWithScores(LEADERBOARD_KEY, -MAX_ENTRIES, -1, { REV: true });
    res.json(top.map(e => ({ id: nanoid(), name: e.value, score: e.score })));
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
});

// POST new score
app.post("/api/leaderboard", async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || typeof score !== "number") return res.status(400).json({ error: "Bad input" });

    // Add to sorted set
    await client.zAdd(LEADERBOARD_KEY, [{ value: name, score }]);

    // Trim to top N
    await client.zRemRangeByRank(LEADERBOARD_KEY, 0, -MAX_ENTRIES - 1);

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));