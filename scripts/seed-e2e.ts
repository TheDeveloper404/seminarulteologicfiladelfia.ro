// Seedează datele necesare suitei Playwright (e2e/) direct în baza de date de test —
// spre deosebire de create-admin.ts / set-shared-password.ts, acest script SCRIE efectiv
// în DB, pentru că testele au nevoie de date deterministe la fiecare rulare. De aceea
// verifică explicit că DATABASE_URL conține "test" în numele bazei, ca să nu poată fi
// rulat din greșeală împotriva producției.
//
// Utilizare: DATABASE_URL=... npx tsx scripts/seed-e2e.ts
// (sau, dacă .env.e2e există: variabilele sunt încărcate automat)

import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../.env.e2e") });

const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl) {
  console.error("Lipsește E2E_DATABASE_URL — vezi .env.e2e.example.");
  process.exit(1);
}

const dbName = new URL(databaseUrl).pathname.replace(/^\//, "");
if (!/test/i.test(dbName)) {
  console.error(
    `DATABASE_URL ("${dbName}") nu conține "test" în numele bazei — refuz să rulez, ` +
      "ca protecție împotriva scrierii din greșeală în producție."
  );
  process.exit(1);
}

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@e2e.local";
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const sharedPassword = process.env.E2E_STUDENT_SHARED_PASSWORD;
const studentPublicId = process.env.E2E_STUDENT_PUBLIC_ID ?? "TEST01A";
const graduatedPublicId = process.env.E2E_GRADUATED_PUBLIC_ID ?? "TEST02B";

if (!adminPassword || !sharedPassword) {
  console.error(
    "Lipsesc E2E_ADMIN_PASSWORD / E2E_STUDENT_SHARED_PASSWORD — vezi .env.e2e.example."
  );
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const adminHash = bcrypt.hashSync(adminPassword!, 12);
  await client.query(
    `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [adminEmail, adminHash]
  );

  const sharedHash = bcrypt.hashSync(sharedPassword!, 12);
  await client.query(
    `INSERT INTO app_settings (id, shared_password_hash) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET shared_password_hash = EXCLUDED.shared_password_hash, updated_at = now()`,
    [sharedHash]
  );

  await client.query(
    `INSERT INTO students (public_id, full_name, enrollment_year, study_year, graduated)
     VALUES ($1, 'E2E Student Activ', 2024, 1, false)
     ON CONFLICT (public_id) DO UPDATE SET full_name = EXCLUDED.full_name, graduated = false`,
    [studentPublicId]
  );

  await client.query(
    `INSERT INTO students (public_id, full_name, enrollment_year, study_year, graduated, graduated_at)
     VALUES ($1, 'E2E Student Absolvent', 2020, 2, true, now())
     ON CONFLICT (public_id) DO UPDATE SET full_name = EXCLUDED.full_name, graduated = true`,
    [graduatedPublicId]
  );

  // Sesiuni și rate-limit vechi nu trebuie să interfereze cu o rulare nouă de teste.
  await client.query("DELETE FROM sessions");
  await client.query("DELETE FROM rate_limit_attempts");

  await client.end();
  console.log(`Seed e2e complet pe baza "${dbName}".`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
