import express from "express";
import cors from "cors";
import { createClient } from "redis";
import path from "path";
import { fileURLToPath } from "url";
import pg from 'pg'; // 1. Import pg for PostgreSQL

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// --- DATABASE CONNECTIONS ---

// A. PostgreSQL Setup (Aiven via Render ENV)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Aiven/Render
});

pool.connect((err) => {
  if (err) console.error('PostgreSQL Connection Error ❌', err.stack);
  else console.log('Connected to Aiven PostgreSQL ✅');
});

// B. Redis Setup (Leaderboard)
const REDIS_URL = process.env.REDIS_URL; 
const LEADERBOARD_KEY = "leaderboard_scores";
const PLAYER_META_KEY = "player_metadata";
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

// --- NEW: POSTGRESQL GAME SAVE ROUTE ---

app.post("/api/save-game", async (req, res) => {
  try {
    const { name, role, stats } = req.body;
    
    // Ensure we have all required data
    if (!name || !role || !stats) {
      return res.status(400).json({ error: "Missing player name, role, or stats" });
    }

    const query = `
      INSERT INTO game_saves (player_name, role_name, gold, food, trading, difficulty) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (player_name) 
      DO UPDATE SET 
          role_name = EXCLUDED.role_name, 
          gold = EXCLUDED.gold, 
          food = EXCLUDED.food, 
          trading = EXCLUDED.trading,
          difficulty = EXCLUDED.difficulty,
          last_saved = CURRENT_TIMESTAMP;
    `;

    // Map stats from the frontend to the DB columns
    const values = [
      name, 
      role, 
      stats.gold, 
      stats.food, 
      stats.trading, 
      stats.difficulty || 'medium'
    ];

    await pool.query(query, values);
    res.status(201).json({ ok: true, message: "Game progress saved to Aiven!" });
  } catch (err) {
    console.error("Postgres Save Error:", err);
    res.status(500).json({ error: "Internal server error saving game" });
  }
});

// --- EXISTING REDIS LEADERBOARD ROUTES ---

app.get("/api/leaderboard", async (req, res) => {
  try {
    const top = await client.zRangeWithScores(LEADERBOARD_KEY, 0, MAX_ENTRIES - 1, { REV: true });
    if (top.length === 0) return res.json([]);

    const names = top.map(e => e.value);
    const timestamps = await client.hmGet(PLAYER_META_KEY, names);

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

app.post("/api/leaderboard", async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || typeof score !== "number") return res.status(400).json({ error: "Bad input" });

    const updateResult = await client.zAdd(LEADERBOARD_KEY, { value: name, score: score }, { GT: true });
    if (updateResult !== 0) {
      await client.hSet(PLAYER_META_KEY, name, new Date().toISOString());
    }
    res.status(201).json({ ok: true, updated: updateResult !== 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving score" });
  }
});

app.delete("/api/leaderboard/:name", async (req, res) => {
  try {
    const name = req.params.name;
    await client.multi().zRem(LEADERBOARD_KEY, name).hDel(PLAYER_META_KEY, name).exec();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting score" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
