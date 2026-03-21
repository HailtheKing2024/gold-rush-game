import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveGame = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    stats: v.object({
      gold: v.number(),
      food: v.number(),
      trading: v.number(),
      difficulty: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("game_saves")
      .withIndex("by_player_name", (q) => q.eq("player_name", args.name))
      .unique();

    const data = {
      player_name: args.name,
      role_name: args.role,
      gold: args.stats.gold,
      food: args.stats.food,
      trading: args.stats.trading,
      difficulty: args.stats.difficulty ?? "medium",
      last_saved: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("game_saves", data);
    }
  },
});

export const checkSave = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const save = await ctx.db
      .query("game_saves")
      .withIndex("by_player_name", (q) => q.eq("player_name", args.name))
      .unique();
    return !!save;
  },
});
