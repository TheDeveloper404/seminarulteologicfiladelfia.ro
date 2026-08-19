// Generează SQL de INSERT pentru primul cont admin — rulează manual pe Postgres-ul de pe VPS.
// Nu scrie direct în DB (consecvent cu restul proiectului: SQL generat, rulat manual de om).
//
// Utilizare: npx tsx scripts/create-admin.ts admin@seminar.ro   (parola se cere interactiv)

import { createInterface } from "readline";
import bcrypt from "bcryptjs";

const [email] = process.argv.slice(2);

if (!email) {
  console.error("Utilizare: npx tsx scripts/create-admin.ts <email>");
  process.exit(1);
}

// Parola citită de la stdin, nu din argv (audit 2026-08-19, SEC-010) — un argument de linie de
// comandă rămâne în istoricul shell-ului și e vizibil în lista de procese a mașinii pe care
// rulează scriptul; stdin nu lasă urmă în niciunul din cele două.
function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

const password = await prompt("Parola admin: ");
if (!password) {
  console.error("Parola nu poate fi goală.");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const escapedEmail = email.replace(/'/g, "''");

console.log(
  `INSERT INTO admins (email, password_hash) VALUES ('${escapedEmail}', '${hash}');`
);
