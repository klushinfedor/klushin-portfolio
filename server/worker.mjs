import { DurableObject } from "cloudflare:workers";
import { startGame, replay } from "./engine.mjs";

const ORIGIN = "https://klushinfedor.github.io";
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
});
async function readSmallBody(request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "", size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) return text + decoder.decode();
    size += part.value.byteLength;
    if (size > 512) { await reader.cancel(); return null; }
    text += decoder.decode(part.value, { stream: true });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowed = request.headers.get("Origin") === ORIGIN;
    const path = url.pathname;
    if (!["/record", "/session", "/moves"].includes(path)) return json({ error: "Not found" }, 404);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: allowed ? 204 : 403, headers: allowed ? {
        "Access-Control-Allow-Origin": ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600"
      } : {} });
    }
    if (!allowed) return json({ error: "Origin denied" }, 403);
    if (path === "/record" ? request.method !== "GET" : request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (request.method === "POST" &&
        (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("Content-Type") || "") ||
         Number(request.headers.get("Content-Length") || 0) > 512)) return json({ error: "Invalid request" }, 400);
    const stub = env.GAME.getByName("global-record-v1");
    const response = await stub.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", ORIGIN);
    headers.set("Vary", "Origin");
    headers.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, headers });
  }
};

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, board TEXT NOT NULL, rng INTEGER NOT NULL, score INTEGER NOT NULL, turn INTEGER NOT NULL, updated INTEGER NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY CHECK(id = 1), score INTEGER NOT NULL)");
    this.sql.exec("INSERT OR IGNORE INTO records (id, score) VALUES (1, 0)");
    this.starts = new Map();
    this.calls = new Map();
  }

  record() { return this.sql.exec("SELECT score FROM records WHERE id = 1").one().score; }

  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === "/record") return json({ record: this.record() });
    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > 512) return json({ error: "Too large" }, 413);
    const bodyText = await readSmallBody(request);
    if (bodyText === null) return json({ error: "Too large" }, 413);
    let body;
    try { body = JSON.parse(bodyText); } catch { return json({ error: "Invalid JSON" }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid body" }, 400);

    if (path === "/session") {
      if (Object.keys(body).length) return json({ error: "Invalid body" }, 400);
      // Short-lived in-memory limit mitigates mass session creation; it is not a player identity.
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const now = Date.now();
      const recent = (this.starts.get(ip) || []).filter(t => now - t < 60000);
      if (recent.length >= 10) return json({ error: "Too many games" }, 429);
      recent.push(now); this.starts.set(ip, recent);
      if (this.starts.size > 1000) this.starts.clear();
      if (Math.random() < .01) this.sql.exec("DELETE FROM games WHERE updated < ?", now - 30 * 86400000);
      const seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
      const id = crypto.randomUUID();
      const game = startGame(seed);
      this.sql.exec("INSERT INTO games (id, board, rng, score, turn, updated) VALUES (?, ?, ?, 0, 0, ?)", id, JSON.stringify(game.board), game.rng, now);
      return json({ id, seed, record: this.record() });
    }

    if (path === "/moves") {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const now = Date.now();
      const bucket = this.calls.get(ip);
      const calls = bucket && now - bucket.since < 60000 ? bucket : { since: now, count: 0 };
      if (++calls.count > 240) return json({ error: "Too many moves" }, 429);
      this.calls.set(ip, calls);
      if (this.calls.size > 1000) this.calls.clear();
      if (Object.keys(body).sort().join(",") !== "from,id,moves" ||
          typeof body.id !== "string" || !/^[0-9a-f-]{36}$/.test(body.id) ||
          !Number.isSafeInteger(body.from) || body.from < 0 ||
          typeof body.moves !== "string" || !/^[LRUD]{1,64}$/.test(body.moves)) return json({ error: "Invalid moves" }, 400);
      const row = this.sql.exec("SELECT board, rng, score, turn FROM games WHERE id = ?", body.id).toArray()[0];
      if (!row) return json({ error: "Session expired" }, 404);
      if (body.from !== row.turn) return json({ error: "Turn mismatch", turn: row.turn, record: this.record() }, 409);
      let next;
      try { next = replay({ board: JSON.parse(row.board), rng: row.rng, score: row.score, turn: row.turn }, body.moves); }
      catch { return json({ error: "Impossible moves" }, 400); }
      // Synchronous SQL in the single named Durable Object keeps board and record serial.
      this.ctx.storage.transactionSync(() => {
        this.sql.exec("UPDATE games SET board = ?, rng = ?, score = ?, turn = ?, updated = ? WHERE id = ?", JSON.stringify(next.board), next.rng, next.score, next.turn, Date.now(), body.id);
        this.sql.exec("UPDATE records SET score = MAX(score, ?) WHERE id = 1", next.score);
      });
      return json({ turn: next.turn, score: next.score, record: this.record() });
    }
    return json({ error: "Not found" }, 404);
  }
}
