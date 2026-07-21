import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";

// Rate limit persistent în Postgres (nu in-memory) — supraviețuiește restart-urilor de deploy.
// Folosit pe login (admin/student) și pe formularul de contact — namespace cheile per caz
// de utilizare (ex. `contact:${ip}`) ca să nu se amestece contoarele.
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 10;

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export async function isRateLimited(
  key: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<boolean> {
  const newResetAt = new Date(Date.now() + windowMs);

  // Upsert atomic: dacă fereastra curentă a expirat, resetează contorul la 1; altfel incrementează.
  // Un singur round-trip, sigur la request-uri concurente (row-level locking din Postgres).
  const result = await db.execute<{ count: number }>(sql`
    INSERT INTO rate_limit_attempts (key, count, reset_at)
    VALUES (${key}, 1, ${newResetAt})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limit_attempts.reset_at < now() THEN 1 ELSE rate_limit_attempts.count + 1 END,
      reset_at = CASE WHEN rate_limit_attempts.reset_at < now() THEN ${newResetAt} ELSE rate_limit_attempts.reset_at END
    RETURNING count
  `);

  const count = Number(result.rows[0]?.count ?? 1);
  return count > maxAttempts;
}
