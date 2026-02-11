import { neon } from "@neondatabase/serverless";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;
const MAX_STORE_ROWS = 500;

function cleanName(name) {
  const text = String(name ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 18);
}

function cleanMode(mode) {
  return mode === "relax" ? "relax" : "classic";
}

function cleanReason(reason) {
  return reason === "forbidden_limit" ? "forbidden_limit" : "time_up";
}

function cleanScore(score) {
  const n = Math.floor(Number(score));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function cleanLimit(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, n));
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (typeof body === "object") return body;
  return {};
}

function getSqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(18) NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 0),
      mode VARCHAR(16) NOT NULL,
      reason VARCHAR(24) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS leaderboard_entries_score_created_idx
    ON leaderboard_entries (score DESC, created_at ASC)
  `;
}

async function readTopEntries(sql, limit) {
  const rows = await sql`
    SELECT
      name,
      score,
      mode,
      reason,
      (EXTRACT(EPOCH FROM created_at) * 1000)::BIGINT AS "createdAtMs"
    FROM leaderboard_entries
    ORDER BY score DESC, created_at ASC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    name: cleanName(row.name) || "Player",
    score: cleanScore(row.score),
    mode: cleanMode(row.mode),
    reason: cleanReason(row.reason),
    createdAtMs: Math.max(1, Math.floor(Number(row.createdAtMs) || Date.now())),
  }));
}

async function trimRows(sql) {
  await sql`
    DELETE FROM leaderboard_entries
    WHERE id IN (
      SELECT id
      FROM leaderboard_entries
      ORDER BY score DESC, created_at ASC
      OFFSET ${MAX_STORE_ROWS}
    )
  `;
}

function methodNotAllowed(res) {
  res.setHeader("Allow", "GET, POST");
  res.status(405).json({ error: "method_not_allowed" });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "POST") {
    return methodNotAllowed(res);
  }

  let sql;
  try {
    sql = getSqlClient();
    await ensureSchema(sql);
  } catch (error) {
    console.error("[leaderboard] database setup failed", error);
    return res.status(500).json({ error: "database_unavailable" });
  }

  try {
    if (req.method === "GET") {
      const limit = cleanLimit(req.query?.limit);
      const entries = await readTopEntries(sql, limit);
      return res.status(200).json({ entries });
    }

    const payload = parseBody(req.body);
    const name = cleanName(payload.name) || "Player";
    const score = cleanScore(payload.score);
    const mode = cleanMode(payload.mode);
    const reason = cleanReason(payload.reason);

    await sql`
      INSERT INTO leaderboard_entries (name, score, mode, reason)
      VALUES (${name}, ${score}, ${mode}, ${reason})
    `;

    await trimRows(sql);
    const entries = await readTopEntries(sql, DEFAULT_LIMIT);
    return res.status(201).json({ entries });
  } catch (error) {
    console.error("[leaderboard] request failed", error);
    return res.status(500).json({ error: "leaderboard_request_failed" });
  }
}
