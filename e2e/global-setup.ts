import { Client } from "pg";
import { requiredEnv } from "./support/env";

// Rulează o singură dată, înaintea întregii suite: golește rate-limit-ul de login (persistent
// în Postgres, cheie pe IP) ca o rulare anterioară eșuată să nu blocheze testele curente —
// vezi src/lib/rate-limit.ts, limita de 5 încercări/15min pe login-ul de student.
export default async function globalSetup() {
  const client = new Client({ connectionString: requiredEnv("E2E_DATABASE_URL") });
  await client.connect();
  await client.query("DELETE FROM rate_limit_attempts");
  await client.query("DELETE FROM sessions");
  await client.end();
}
