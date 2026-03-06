import express from "express";
import cors from "cors";
import { createClient } from "redis";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

const REDIS_URL = process.env.REDIS_URL; 
const LEADERBOARD_KEY = "leaderboard_scores";
const PLAYER_META_KEY = "player_metadata"; // Hash to store dates/extra info
const MAX_ENTRIES = 10;

const client = createClient({ url: REDIS_URL });

client.on('error', err => console.error('Redis Client Error', err));

(async () => {
  try {
    await client.connect();
    console.log("Connected to Aiven Redis ✅");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
  }
})();

// GET: Fetch top players and match them with their timestamps
app.get("/api/leaderboard", async (req, res) => {
  try {
    // 1. Get the top Names and Scores (REV: true gets highest first)
    const top = await client.zRangeWithScores(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, { REV: true });
    
    if (top.length === 0) return res.json([]);

    // 2. Fetch all timestamps for these players in one round-trip (MGET from a Hash)
    const names = top.map(e => e.value);
    const timestamps = await client.hmGet(PLAYER_META_KEY, names);

    // 3. Combine score and timestamp for the frontend
    const result = top.map((e, index) => ({
      name: e.value,
      score: e.score,
      timestamp: timestamps[index] || new Date().toISOString()
    }));
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
});

// POST: Add or Update score ONLY if it is higher (Redis 8 GT flag)
app.post("/api/leaderboard", async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || typeof score !== "number") return res.status(400).json({ error: "Bad input" });

    // Redis 8 'GT' (Greater Than) flag: 
    // Updates the score only if the new score is higher than the current one.
    // If the player doesn't exist, it adds them normally.
    const updateResult = await client.zAdd(LEADERBOARD_KEY, 
      { value: name, score: score }, 
      { GT: true } 
    );

    // Only update the timestamp if the score was actually updated or newly added
    // zAdd returns 1 for new, or null/0 if GT condition wasn't met (in some client versions)
    if (updateResult !== 0) {
      await client.hSet(PLAYER_META_KEY, name, new Date().toISOString());
    }

    res.status(201).json({ ok: true, updated: updateResult !== 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving score" });
  }
});

// DELETE: Now much faster (O(1) instead of searching strings)
app.delete("/api/leaderboard/:name", async (req, res) => {
  try {
    const name = req.params.name;
    
    // Multi ensures both the score and metadata are removed together
    await client.multi()
      .zRem(LEADERBOARD_KEY, name)
      .hDel(PLAYER_META_KEY, name)
      .exec();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting score" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));