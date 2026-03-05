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

// Wrap connection in async IIFE
const client = createClient({ url: REDIS_URL });
(async () => {
  try {
    await client.connect();
    console.log("Connected to Aiven Redis ✅");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1); // stop server if Redis connection fails
  }
})();

// GET top leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    const top = await client.zRangeWithScores(LEADERBOARD_KEY, -MAX_ENTRIES, -1, { REV: true });
    res.json(top.map(e => ({ id: nanoid(), name: e.value, score: e.score })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching leaderboard" });
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
    console.error(err);
    res.status(500).json({ error: "Error saving score" });
  }
});

// DELETE a score by name (optional)
app.delete("/api/leaderboard/:name", async (req, res) => {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ error: "Name required" });

    const removed = await client.zRem(LEADERBOARD_KEY, name);
    if (removed === 0) return res.status(404).json({ error: "Name not found" });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting score" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));