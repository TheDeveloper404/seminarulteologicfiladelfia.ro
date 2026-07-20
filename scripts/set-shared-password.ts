// Generează SQL de upsert pentru parola comună a studenților — rulează manual pe Postgres.
//
// Utilizare: npx tsx scripts/set-shared-password.ts parola-noua

import bcrypt from "bcryptjs";

const [password] = process.argv.slice(2);

if (!password) {
  console.error("Utilizare: npx tsx scripts/set-shared-password.ts <parola>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

console.log(
  `INSERT INTO app_settings (id, shared_password_hash) VALUES (1, '${hash}')\n` +
    `ON CONFLICT (id) DO UPDATE SET shared_password_hash = EXCLUDED.shared_password_hash, updated_at = now();`
);
