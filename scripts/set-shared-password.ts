// Generează SQL de upsert pentru parola comună a studenților — rulează manual pe Postgres.
//
// Utilizare: npx tsx scripts/set-shared-password.ts parola-noua

import bcrypt from "bcryptjs";

const [password] = process.argv.slice(2);

if (!password) {
  console.error("Utilizare: npx tsx scripts/set-shared-password.ts <parola>");
  process.exit(1);
}

// Normalizată (trim + lowercase) — verificarea la login face aceeași normalizare, ca studenții
// să nu fie respinși din cauza Caps Lock/Shift pe mobil (parolă comună, deci nu case-sensitive
// nu slăbește practic securitatea).
const normalized = password.trim().toLowerCase();
const hash = bcrypt.hashSync(normalized, 12);

console.log(
  `INSERT INTO app_settings (id, shared_password_hash) VALUES (1, '${hash}')\n` +
    `ON CONFLICT (id) DO UPDATE SET shared_password_hash = EXCLUDED.shared_password_hash, updated_at = now();\n` +
    `-- Invalidează sesiunile de student deja emise cu parola veche (rămâneau valabile până la 7 zile altfel):\n` +
    `DELETE FROM sessions WHERE role = 'student';`
);
