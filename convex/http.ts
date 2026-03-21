import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/leaderboard",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const scores = await ctx.runQuery(api.leaderboard.getTopScores, {});
    return Response.json(scores);
  }),
});

http.route({
  path: "/api/leaderboard",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const name = body?.name;
    const score = body?.score;

    if (typeof name !== "string" || typeof score !== "number") {
      return Response.json({ error: "Bad input" }, { status: 400 });
    }

    await ctx.runMutation(api.leaderboard.updateScore, { name, score });
    return Response.json({ ok: true }, { status: 201 });
  }),
});

http.route({
  path: "/api/leaderboard",
  method: "DELETE",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    if (!name) {
      return Response.json({ error: "Missing name" }, { status: 400 });
    }

    await ctx.runMutation(api.leaderboard.deleteScore, { name });
    return Response.json({ ok: true });
  }),
});

http.route({
  path: "/api/save-game",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const name = body?.name;
    const role = body?.role;
    const stats = body?.stats;

    if (typeof name !== "string" || typeof role !== "string" || typeof stats !== "object" || stats === null) {
      return Response.json({ error: "Missing player name, role, or stats" }, { status: 400 });
    }

    await ctx.runMutation(api.games.saveGame, { name, role, stats });
    return Response.json({ ok: true, message: "Game saved to Convex" }, { status: 201 });
  }),
});

http.route({
  path: "/api/check-save",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    if (!name) {
      return Response.json({ exists: false }, { status: 200 });
    }

    const exists = await ctx.runQuery(api.games.checkSave, { name });
    return Response.json({ exists });
  }),
});

export default http;
