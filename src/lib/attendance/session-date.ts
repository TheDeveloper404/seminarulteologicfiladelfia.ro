const SESSION_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * `YYYY-MM-DD` care e și o dată reală din calendar. Regex-ul singur lăsa să treacă `2026-02-31`,
 * pe care Postgres îl respinge la cast (500) în loc de un mesaj de validare.
 */
export function isValidSessionDate(value: string): boolean {
  const match = SESSION_DATE_RE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Data de azi în fusul orar al seminarului (nu al serverului, care rulează pe UTC). */
export function todaySessionDate(now: Date = new Date()): string {
  // Locale-ul `en-CA` formatează ca `YYYY-MM-DD`.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
