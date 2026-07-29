import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";

// Rate limit persistent în Postgres (nu in-memory) — supraviețuiește restart-urilor de deploy.
// Folosit pe login (admin/student) și pe formularul de contact — namespace cheile per caz
// de utilizare (ex. `contact:${ip}`) ca să nu se amestece contoarele.
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 10;

// IMPORTANT: nu lua NICIODATĂ primul element din `x-forwarded-for`. nginx e configurat cu
// `$proxy_add_x_forwarded_for`, care PĂSTREAZĂ headerul trimis de client și adaugă `$remote_addr`
// la final; Cloudflare face la fel. Deci un atacator care trimite `X-Forwarded-For: 1.2.3.4`
// controlează primul element — iar dacă îl rotea la fiecare cerere, primea o cheie nouă de rate
// limit de fiecare dată, adică brute-force nelimitat pe login și spam nelimitat pe contact.
//
// Ordinea de încredere, de la cea mai sigură:
//   1. `cf-connecting-ip` — pus de Cloudflare, care SUPRASCRIE orice valoare trimisă de client;
//   2. `x-real-ip` — pus de nginx din `$remote_addr` (adresa conexiunii, nefalsificabilă);
//   3. ULTIMUL element din `x-forwarded-for` — cel adăugat de nginx, nu cel trimis de client.
export async function getClientIp(): Promise<string> {
  const headerList = await headers();

  const cloudflareIp = headerList.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwardedChain = headerList.get("x-forwarded-for");
  const lastHop = forwardedChain?.split(",").pop()?.trim();
  return lastHop || "unknown";
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

// De apelat după o autentificare REUȘITĂ. Fără asta, contorul e per IP și numără și reușitele,
// iar studenții conectați la același wifi (un singur IP public la ieșire) se blochează unii pe
// alții: al 6-lea login corect din clădire în 15 minute era respins cu „Prea multe încercări".
// Ștergerea cheii pe succes păstrează protecția reală — brute-force-ul rămâne limitat la 5
// EȘECURI consecutive — fără să penalizeze utilizarea normală.
export async function clearRateLimit(key: string): Promise<void> {
  await db.execute(sql`DELETE FROM rate_limit_attempts WHERE key = ${key}`);
}
