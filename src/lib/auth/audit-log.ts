// Logging minim pe evenimente de autentificare (audit 2026-08-19, SEC-007) — înainte de asta,
// un brute-force reușit sau o rundă de rate-limit declanșată nu lăsau nicio urmă verificabilă
// ulterior. Loghează DOAR IP + rezultat, niciodată parola/token-ul sau ID-ul/emailul introdus
// (categoria 08 din audit interzice explicit PII/secrete în loguri).
import { notifySlack } from "@/lib/slack-alert";

export function logAuthEvent(
  event: "rate_limited" | "turnstile_failed" | "login_failed",
  role: "admin" | "student",
  ip: string
): void {
  console.warn(
    JSON.stringify({ type: "auth_event", event, role, ip, at: new Date().toISOString() })
  );
  // Blocare dupa prea multe incercari → Slack (fara IP). Poate fi si wifi-ul comun al seminarului.
  if (event === "rate_limited") {
    void notifySlack(`login-rate-limited-${role}`, `${role === "admin" ? "login admin" : "login portal studenti"}: o adresa IP a fost blocata dupa prea multe incercari gresite`);
  }
}
