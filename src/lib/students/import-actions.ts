"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { generateUniquePublicId } from "./generate-public-id";
import { parseRegistryFile, type RowIssue } from "./import";

export type ImportState =
  | { error: string }
  | { created: number; skipped: RowIssue[] }
  | null;

// Registrele sunt fișiere mici (câteva zeci de rânduri) — limită generoasă dar nu nelimitată,
// ca să nu accepte orice fișier uriaș trimis din greșeală de admin.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export async function importStudentsFromRegistry(
  _prevState: ImportState,
  formData: FormData
): Promise<ImportState> {
  await requireAdmin();

  const file = formData.get("file");
  const enrollmentYear = Number(formData.get("enrollmentYear"));

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selectează un fișier Excel sau CSV." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "Fișierul este prea mare (limită 5MB)." };
  }
  const lowerName = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
    return { error: "Tip de fișier nepermis. Acceptat: .xlsx, .xls, .csv." };
  }
  if (!Number.isInteger(enrollmentYear) || enrollmentYear < 2000 || enrollmentYear > 2100) {
    return { error: "Anul de înscriere nu este valid." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed: Awaited<ReturnType<typeof parseRegistryFile>>;
  try {
    parsed = await parseRegistryFile(buffer, file.name);
  } catch {
    // Nu propagăm eroarea brută din exceljs (poate conține detalii interne) — un fișier
    // corupt/greșit formatat e o eroare de utilizator, nu una de sistem.
    return { error: "Fișierul nu a putut fi citit. Verifică formatul și încearcă din nou." };
  }

  if (parsed.rows.length === 0 && parsed.issues.length === 0) {
    return { error: "Fișierul nu conține niciun rând de date." };
  }

  const issues: RowIssue[] = [...parsed.issues];
  let created = 0;

  for (const row of parsed.rows) {
    try {
      const publicId = await generateUniquePublicId();
      // INSERT...WHERE NOT EXISTS într-o singură instrucțiune SQL — verificarea de duplicat și
      // inserarea sunt atomice, nu mai există fereastra de timp (TOCTOU) dintre „citesc numele
      // existente" și „inserez" în care un al doilea import concurent ar putea trece de aceeași
      // verificare (găsit la code review 2026-08-20). Nu adaugă o constrângere UNIQUE la nivel de
      // schemă — nume reale se pot repeta legitim de-a lungul anilor, nu vrem să blocăm asta.
      const result = await db.execute(sql`
        INSERT INTO students
          (public_id, full_name, phone, enrollment_year, study_year, birth_date, birth_locality, birth_county, address, home_church)
        SELECT ${publicId}, ${row.fullName}, ${row.phone}, ${enrollmentYear}, 1, ${row.birthDate}, ${row.birthLocality}, ${row.birthCounty}, ${row.address}, ${row.homeChurch}
        WHERE NOT EXISTS (
          SELECT 1 FROM students WHERE lower(trim(full_name)) = lower(trim(${row.fullName}))
        )
      `);

      if (result.rowCount === 0) {
        issues.push({
          rowNumber: row.rowNumber,
          reason: `${row.fullName}: există deja un student cu acest nume — nu a fost importat, verifică manual.`,
        });
      } else {
        created += 1;
      }
    } catch {
      // Un rând care eșuează (eroare DB neașteptată) nu trebuie să oprească restul fișierului —
      // best-effort, nu totul-sau-nimic (găsit la code review 2026-08-20: bucla nu avea try/catch,
      // o eroare la mijlocul unui import de 40 de rânduri arunca fără feedback despre ce s-a
      // salvat deja).
      issues.push({
        rowNumber: row.rowNumber,
        reason: `${row.fullName}: eroare neașteptată la salvare — rândul nu a fost importat, poți încerca din nou separat.`,
      });
    }
  }

  revalidatePath("/admin/studenti");

  return { created, skipped: issues };
}
