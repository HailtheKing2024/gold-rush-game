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

// Serve static frontend files
app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

const REDIS_URL = process.env.REDIS_URL; // Aiven Redis connection string
const LEADERBOARD_KEY = "leaderboard_scores";
const MAX_ENTRIES = 10;

// Connect to Redis
const client = createClient({ url: REDIS_URL });
(async () => {
  try {
    await client.connect();
    console.log("Connected to Aiven Redis ✅");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
  }
})();

// GET leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    const top = await client.zRangeWithScores(LEADERBOARD_KEY, -MAX_ENTRIES, -1, { REV: true });
    const parsed = top.map(e => {
      try {
        const obj = JSON.parse(e.value);
        return {
          id: obj.id,
          name: obj.name,
          score: obj.score,
          timestamp: obj.timestamp // ISO string
        };
      } catch {
        return { id: nanoid(), name: e.value, score: e.score, timestamp: null };
      }
    });
    res.json(parsed);
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

    const entry = JSON.stringify({
      id: nanoid(),
      name,
      score,
      timestamp: new Date().toISOString() // ISO string timestamp
    });

    await client.zAdd(LEADERBOARD_KEY, [{ value: entry, score }]);
    await client.zRemRangeByRank(LEADERBOARD_KEY, 0, -MAX_ENTRIES - 1);

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving score" });
  }
});

// DELETE score by name
app.delete("/api/leaderboard/:name", async (req, res) => {
  try {
    const nameToRemove = req.params.name;
    if (!nameToRemove) return res.status(400).json({ error: "Name required" });

    const allEntries = await client.zRange(LEADERBOARD_KEY, 0, -1);
    const toRemove = allEntries.filter(entry => {
      try {
        const obj = JSON.parse(entry);
        return obj.name === nameToRemove;
      } catch {
        return false;
      }
    });

    if (toRemove.length === 0) return res.status(404).json({ error: "Name not found" });

    const removedCount = await client.zRem(LEADERBOARD_KEY, ...toRemove);
    res.json({ ok: true, removed: removedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting score" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));