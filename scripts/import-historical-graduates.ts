// Generează SQL de INSERT pentru cei ~317 absolvenți istorici (1999-2024) din
// "docs/sursa-date-absolventi/evidenta.txt" (extras cu antiword din arhiva pe hârtie a
// Seminarului). Rulează manual pe Postgres-ul de pe VPS (SQL generat, nu scrie direct în DB —
// consecvent cu restul proiectului, vezi scripts/create-admin.ts).
//
// Acești absolvenți NU au cont de portal funcțional — apar doar informativ în
// /admin/absolventi (is_historical_import = true) și nu pot primi diplomă/certificat generat
// (decizie explicită, discuție 2026-08-19).
//
// Cazurile ambigue din sursă (an incomplet, dată lipsă) sunt EXCLUSE din SQL și listate separat
// la stderr pentru completare manuală de administrator — nu sunt ghicite.
//
// Utilizare: npx tsx scripts/import-historical-graduates.ts > import-historici.sql

import { randomInt } from "crypto";
import { readFileSync } from "fs";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomPublicId(used: Set<string>): string {
  let id: string;
  do {
    id = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  } while (used.has(id));
  used.add(id);
  return id;
}

type Row = { nr: string; name: string; enrollDate: string; gradYear: string; notes: string };

function parseRows(text: string): Row[] {
  const lines = text.split("\n");
  const rows: Row[] = [];

  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    const cols = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cols.length < 5) continue;
    const [nr, name, enrollDate, gradYear, notes] = cols;
    if (nr === "Nr." || nr === "crt." || (!nr && !name)) continue; // header rows

    if (!nr && name) {
      // Linie de continuare — restul unui nume prea lung, se lipește la rândul anterior.
      const prev = rows[rows.length - 1];
      if (prev) prev.name = `${prev.name} ${name}`.trim();
      continue;
    }
    if (nr) {
      rows.push({ nr, name, enrollDate, gradYear, notes });
    }
  }

  return rows;
}

function parseEnrollYear(enrollDate: string): number | null {
  const match = enrollDate.match(/^\d{2}\.\d{2}\.(\d{4})$/);
  return match ? Number(match[1]) : null;
}

function isValidGradYear(gradYear: string): boolean {
  return /^\d{4}$/.test(gradYear);
}

const srcPath = "docs/sursa-date-absolventi/evidenta.txt";
const text = readFileSync(srcPath, "utf-8");
const rows = parseRows(text);

const usedIds = new Set<string>();
const sqlLines: string[] = [];
const flagged: string[] = [];

for (const row of rows) {
  const enrollYear = parseEnrollYear(row.enrollDate);
  const gradYearValid = isValidGradYear(row.gradYear);

  if (enrollYear === null || !gradYearValid) {
    flagged.push(
      `Nr. ${row.nr} — ${row.name}: dată/an ambiguu în sursă (înscriere="${row.enrollDate}", absolvire="${row.gradYear}") — de completat manual.`
    );
    continue;
  }

  const publicId = randomPublicId(usedIds);
  const escapedName = row.name.replace(/'/g, "''");
  const escapedNotes = row.notes.replace(/'/g, "''");
  const notesValue = escapedNotes ? `'${escapedNotes}'` : "NULL";

  sqlLines.push(
    `INSERT INTO students (public_id, full_name, enrollment_year, study_year, graduated, graduated_at, notes, is_historical_import) VALUES ('${publicId}', '${escapedName}', ${enrollYear}, 2, true, '${row.gradYear}-01-01', ${notesValue}, true);`
  );
}

console.log(`-- Import absolvenți istorici — ${sqlLines.length} rânduri (din ${rows.length} parsate)`);
console.log(`-- Generat: ${new Date().toISOString()}`);
console.log("BEGIN;");
for (const line of sqlLines) console.log(line);
console.log("COMMIT;");

if (flagged.length > 0) {
  console.error(`\n${flagged.length} rânduri EXCLUSE din SQL (dată/an ambiguu în sursă):`);
  for (const line of flagged) console.error(`  - ${line}`);
}
