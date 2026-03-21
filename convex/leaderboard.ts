import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTopScores = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("leaderboard")
      .withIndex("by_score")
      .order("desc")
      .take(10);
  },
});

export const updateScore = mutation({
  args: { name: v.string(), score: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (!existing || args.score > existing.score) {
      const data = { 
        name: args.name, 
        score: args.score, 
        timestamp: new Date().toISOString() 
      };
      
      if (existing) {
        await ctx.db.patch(existing._id, data);
      } else {
        await ctx.db.insert("leaderboard", data);
      }
    }
  },
});

export const deleteScore = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return { ok: true };
  },
});
