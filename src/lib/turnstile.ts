const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Verificare server-side a token-ului Cloudflare Turnstile (anti-bot pe login admin/student).
// Dacă TURNSTILE_SECRET_KEY nu e setat (dev local, fără cont Cloudflare Turnstile configurat),
// verificarea e sărită — protecția reală există doar când cheia e configurată (obligatoriu pe
// VPS/producție, vezi .env.local.example).
export async function verifyTurnstileToken(
  token: string | null,
  ip: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true;
  if (!token) return false;

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: secretKey, response: token, remoteip: ip }),
  });

  const data = (await response.json()) as { success: boolean };
  return data.success === true;
}
