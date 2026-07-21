import { headers } from "next/headers";

// Rate limit in-memory, suficient pentru un singur proces Node pe VPS (nu multi-instanță).
// Folosit pe login (admin/student) și pe formularul de contact — namespace cheile per caz
// de utilizare (ex. `contact:${ip}`) ca să nu se amestece contoarele.
const attempts = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 10;

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export function isRateLimited(
  key: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW_MS
): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > maxAttempts;
}
