import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

function preflight() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

http.route({
  path: "/api/leaderboard",
  method: "OPTIONS",
  handler: httpAction(async () => preflight()),
});

http.route({
  path: "/api/leaderboard",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const scores = await ctx.runQuery(api.leaderboard.getTopScores, {});
    return withCors(scores);
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
      return withCors({ error: "Bad input" }, { status: 400 });
    }

    await ctx.runMutation(api.leaderboard.updateScore, { name, score });
    return withCors({ ok: true }, { status: 201 });
  }),
});

http.route({
  path: "/api/leaderboard",
  method: "DELETE",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    if (!name) {
      return withCors({ error: "Missing name" }, { status: 400 });
    }

    await ctx.runMutation(api.leaderboard.deleteScore, { name });
    return withCors({ ok: true });
  }),
});

http.route({
  path: "/api/save-game",
  method: "OPTIONS",
  handler: httpAction(async () => preflight()),
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
      return withCors({ error: "Missing player name, role, or stats" }, { status: 400 });
    }

    await ctx.runMutation(api.games.saveGame, { name, role, stats });
    return withCors({ ok: true, message: "Game saved to Convex" }, { status: 201 });
  }),
});

http.route({
  path: "/api/check-save",
  method: "OPTIONS",
  handler: httpAction(async () => preflight()),
});

http.route({
  path: "/api/check-save",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    if (!name) {
      return withCors({ exists: false }, { status: 200 });
    }

    const exists = await ctx.runQuery(api.games.checkSave, { name });
    return withCors({ exists });
  }),
});

export default http;
