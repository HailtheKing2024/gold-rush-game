import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  game_saves: defineTable({
    player_name: v.string(),
    role_name: v.string(),
    gold: v.number(),
    food: v.number(),
    trading: v.number(),
    difficulty: v.string(),
    last_saved: v.number(),
  }).index("by_player_name", ["player_name"]),

  leaderboard: defineTable({
    name: v.string(),
    score: v.number(),
    timestamp: v.string(),
  })
    .index("by_score", ["score"])
    .index("by_name", ["name"]),
});
