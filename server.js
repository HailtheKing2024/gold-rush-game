import express from "express";
import cors from "cors";
import { createClient } from "redis";
import { nanoid } from "nanoid";
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
const MAX_ENTRIES = 10;

const client = createClient({ url: REDIS_URL });

// V5 CRITICAL: Prevent process crashes on network blips
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

// GET: Modern v5 Syntax
app.get("/api/leaderboard", async (req, res) => {
  try {
    // REV: true gets the highest scores first
    const top = await client.zRangeWithScores(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, { REV: true });
    
    const parsed = top.map(e => {
      try {
        return JSON.parse(e.value);
      } catch {
        // Fallback for any old/corrupt data in your Redis
        return { name: "Player", score: e.score, timestamp: new Date().toISOString() };
      }
    });
    
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
});

// POST: Fixed for Node Redis v5 and Aiven compatibility
app.post("/api/leaderboard", async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || typeof score !== "number") return res.status(400).json({ error: "Bad input" });

    const entry = JSON.stringify({
      id: nanoid(),
      name,
      score,
      timestamp: new Date().toISOString() 
    });

    // In v5, zAdd takes an object inside an array
    await client.zAdd(LEADERBOARD_KEY, [{ value: entry, score }]);
    
    // Trim to top 10
    await client.zRemRangeByRank(LEADERBOARD_KEY, 0, -MAX_ENTRIES - 1);

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving score" });
  }
});

// DELETE: Fixed search logic for Aiven
app.delete("/api/leaderboard/:name", async (req, res) => {
  try {
    const nameToRemove = req.params.name;
    const allEntries = await client.zRange(LEADERBOARD_KEY, 0, -1);
    
    const toRemove = allEntries.filter(entry => {
      try {
        return JSON.parse(entry).name === nameToRemove;
      } catch { return false; }
    });

    if (toRemove.length > 0) {
      // v5: Pass the array directly to zRem
      await client.zRem(LEADERBOARD_KEY, toRemove);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting score" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));