// Generează SQL de upsert pentru parola comună a studenților — rulează manual pe Postgres.
//
// Utilizare: npx tsx scripts/set-shared-password.ts   (parola se cere interactiv, nu ca argument)

import { createInterface } from "readline";
import bcrypt from "bcryptjs";

const MIN_LENGTH = 12;

// Citită de la stdin, nu din argv (audit 2026-08-19, SEC-010) — un argument de linie de
// comandă rămâne în istoricul shell-ului și e vizibil în lista de procese a mașinii pe care
// rulează scriptul; stdin nu lasă urmă în niciunul din cele două.
function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

const password = await prompt("Parola comună nouă: ");

// Lungime minimă (audit 2026-08-19, SEC-006) — e singura parolă care protejează notele și
// prezența TUTUROR studenților; fără un prag minim, un operator putea alege ceva ghicibil în
// limitele rate-limit-ului de login (5 încercări/15min).
if (password.trim().length < MIN_LENGTH) {
  console.error(`Parola trebuie să aibă cel puțin ${MIN_LENGTH} caractere.`);
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
