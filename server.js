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
const PLAYER_PREFIX = "player:"; // Redis 8 JSON keys
const MAX_ENTRIES = 10;

const client = createClient({ url: REDIS_URL });

// REQUIRED: Redis 5.x+ requires an error listener to prevent process crashes
client.on('error', err => console.error('Redis Client Error', err));

(async () => {
  try {
    await client.connect();
    console.log("Connected to Aiven Redis 8 ✅");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
  }
})();

// GET leaderboard using Redis 8 JSON & Sorted Sets
app.get("/api/leaderboard", async (req, res) => {
  try {
    // 1. Get the top IDs and scores from the Sorted Set
    const topMembers = await client.zRangeWithScores(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, { REV: true });
    
    if (topMembers.length === 0) return res.json([]);

    // 2. Map IDs to their JSON keys
    const keys = topMembers.map(m => `${PLAYER_PREFIX}${m.value}`);

    // 3. Redis 8 Multi-get: Fetch all player JSON objects in one go
    const playerStats = await client.json.mGet(keys, '$');

    const result = topMembers.map((member, index) => {
      const data = playerStats[index] ? playerStats[index][0] : {};
      return {
        id: member.value,
        name: data.name || "Unknown",
        score: member.score,
        timestamp: data.timestamp
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
});

// POST new score using Redis 8 JSON
app.post("/api/leaderboard", async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || typeof score !== "number") return res.status(400).json({ error: "Bad input" });

    const id = nanoid();
    const playerKey = `${PLAYER_PREFIX}${id}`;

    // Redis 8: Use a transaction (Multi) to ensure both set & score are saved together
    await client.multi()
      .json.set(playerKey, '$', {
        id,
        name,
        timestamp: new Date().toISOString()
      })
      .zAdd(LEADERBOARD_KEY, { value: id, score })
      // Automatically trim the leaderboard to keep it fast
      .zRemRangeByRank(LEADERBOARD_KEY, 0, -(MAX_ENTRIES + 1)) 
      .exec();

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving score" });
  }
});

// DELETE score by ID (Faster in Redis 8)
app.delete("/api/leaderboard/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const playerKey = `${PLAYER_PREFIX}${id}`;

    // Delete from both the index (Sorted Set) and the data (JSON)
    const [removedFromSet] = await client.multi()
      .zRem(LEADERBOARD_KEY, id)
      .del(playerKey)
      .exec();

    if (removedFromSet === 0) return res.status(404).json({ error: "Player not found" });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting score" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));