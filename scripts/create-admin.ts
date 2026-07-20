// Generează SQL de INSERT pentru primul cont admin — rulează manual pe Postgres-ul de pe VPS.
// Nu scrie direct în DB (consecvent cu restul proiectului: SQL generat, rulat manual de om).
//
// Utilizare: npx tsx scripts/create-admin.ts admin@seminar.ro parola-mea-secreta

import bcrypt from "bcryptjs";

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error("Utilizare: npx tsx scripts/create-admin.ts <email> <parola>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const escapedEmail = email.replace(/'/g, "''");

console.log(
  `INSERT INTO admins (email, password_hash) VALUES ('${escapedEmail}', '${hash}');`
);
