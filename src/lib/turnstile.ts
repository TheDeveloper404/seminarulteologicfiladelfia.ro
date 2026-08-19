const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Verificare server-side a token-ului Cloudflare Turnstile (anti-bot pe login admin/student).
// Dacă TURNSTILE_SECRET_KEY nu e setat: în dev local (fără cont Cloudflare Turnstile
// configurat) verificarea e sărită, ca să nu blocheze dezvoltarea. În producție însă eșuează
// ÎNCHIS (audit 2026-08-19, SEC-002) — dacă variabila dispare accidental la un deploy/edit de
// .env, login-ul se blochează vizibil (500) în loc să continue silențios fără protecție
// anti-bot, exact controlul pe care se bazează rate-limiting-ul din SEC-001.
export async function verifyTurnstileToken(
  token: string | null,
  ip: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TURNSTILE_SECRET_KEY lipsă în producție — verificare anti-bot obligatorie.");
    }
    return true;
  }
  if (!token) return false;

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: secretKey, response: token, remoteip: ip }),
  });

  const data = (await response.json()) as { success: boolean };
  return data.success === true;
}
