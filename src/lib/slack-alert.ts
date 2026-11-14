// Alertă pe Slack (botul `detalia`, canalul #seminar-site-cazut-formular-sau-login) când ceva pică în producție.
// Mesajul nu conține datele vizitatorului: doar ce a picat, codul erorii și ora.
// Nu aruncă niciodată; fără SLACK_BOT_TOKEN / SLACK_ALERT_CHANNEL nu face nimic (local, teste).
// Aceeași alertă (cheie) pleacă cel mult o dată la 10 minute, ca o pană să nu inunde canalul.

type Env = Record<string, string | undefined>;

export const ALERT_THROTTLE_MS = 10 * 60_000;
const lastSent = new Map<string, number>();

export async function notifySlack(key: string, text: string, env: Env = process.env, now = Date.now()): Promise<void> {
  const token = env.SLACK_BOT_TOKEN;
  const channel = env.SLACK_ALERT_CHANNEL;
  if (!token || !channel) return;

  const last = lastSent.get(key);
  if (last !== undefined && now - last < ALERT_THROTTLE_MS) return;

  const at = new Intl.DateTimeFormat("ro-RO", { dateStyle: "short", timeStyle: "medium", timeZone: "Europe/Bucharest" }).format(now);
  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ channel, text: `:red_circle: *seminar* — ${text} (${at})` }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    // Pauza de 10 min pornește doar după o trimitere reușită: o eroare Slack nu ascunde alerta următoare.
    if (data.ok) lastSent.set(key, now);
    else console.error(`[slack-alert] Slack a refuzat mesajul (${data.error})`);
  } catch (error) {
    console.error(`[slack-alert] trimiterea a eșuat (${error instanceof Error ? error.name : "UNKNOWN"})`);
  }
}
