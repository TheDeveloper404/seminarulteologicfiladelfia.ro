import { Readable } from "stream";
import ExcelJS from "exceljs";

// Ordine fixă de coloane (Nume, Dată naștere, Localitate, Județ, Adresă, Biserică, Telefon),
// decisă cu clientul — vezi BACKLOG.md. Constanta pentru UI trăiește separat, în
// registry-columns.ts, ca import-form.tsx ("use client") să n-o poată importa din acest fișier
// și să tragă exceljs în bundle-ul de client.

export type ParsedRegistryRow = {
  rowNumber: number;
  fullName: string;
  birthDate: string | null;
  birthLocality: string | null;
  birthCounty: string | null;
  address: string | null;
  homeChurch: string | null;
  phone: string | null;
};

export type RowIssue = { rowNumber: number; reason: string };

function isCellError(value: ExcelJS.CellValue): value is ExcelJS.CellErrorValue {
  return typeof value === "object" && value !== null && "error" in value;
}

function cellToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("richText" in value) {
      return value.richText.map((part) => part.text).join("");
    }
    if ("text" in value) return String(value.text ?? "");
    if ("result" in value) return String(value.result ?? "");
    if ("hyperlink" in value) return String(value.hyperlink ?? "");
  }
  return String(value).trim();
}

function capField(text: string, max: number): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function parseBirthDateCell(
  value: ExcelJS.CellValue
): { value: string | null } | { error: string } {
  if (value === null || value === undefined) return { value: null };

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return { error: "dată de naștere invalidă" };
    return { value: value.toISOString().slice(0, 10) };
  }

  const text = cellToText(value).trim();
  if (!text) return { value: null };

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (isoMatch) {
    const iso = isoMatch[0];
    if (Number.isNaN(Date.parse(iso))) return { error: "dată de naștere invalidă" };
    return { value: iso };
  }

  const dmyMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(text);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    const iso = `${y}-${month}-${day}`;
    if (Number.isNaN(Date.parse(iso))) return { error: "dată de naștere invalidă" };
    return { value: iso };
  }

  return { error: 'format dată de naștere nerecunoscut (folosește "ZZ.LL.AAAA")' };
}

export async function parseRegistryFile(
  buffer: Buffer,
  filename: string
): Promise<{ rows: ParsedRegistryRow[]; issues: RowIssue[] }> {
  const workbook = new ExcelJS.Workbook();
  const isCsv = filename.toLowerCase().endsWith(".csv");

  if (isCsv) {
    await workbook.csv.read(Readable.from(buffer));
  } else {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return {
      rows: [],
      issues: [{ rowNumber: 0, reason: "Fișierul nu conține nicio foaie de calcul." }],
    };
  }

  const rows: ParsedRegistryRow[] = [];
  const issues: RowIssue[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header

    const rawCells = [1, 2, 3, 4, 5, 6, 7].map((col) => row.getCell(col).value);

    // O celulă cu eroare de formulă (#REF!, #N/A etc.) nu e text — cellToText ar da
    // "[object Object]" dacă am lăsa-o să treacă mai departe; mai bine sărim rândul cu un motiv
    // clar decât să stocăm o valoare garbage în DB.
    const errorColumnIndex = rawCells.findIndex(isCellError);
    if (errorColumnIndex !== -1) {
      const errorValue = rawCells[errorColumnIndex] as ExcelJS.CellErrorValue;
      issues.push({
        rowNumber,
        reason: `Coloana ${errorColumnIndex + 1} conține o eroare de formulă (${errorValue.error}).`,
      });
      return;
    }

    const textCells = rawCells.map((v) => cellToText(v));
    const [nameRaw, , localityRaw, countyRaw, addressRaw, churchRaw, phoneRaw] = textCells;

    const isBlankRow = textCells.every((c) => !c.trim());
    if (isBlankRow) return;

    const fullName = nameRaw.trim();
    if (!fullName) {
      issues.push({ rowNumber, reason: "Lipsește numele." });
      return;
    }
    if (fullName.length > 255) {
      issues.push({ rowNumber, reason: `${fullName.slice(0, 40)}…: numele e prea lung (peste 255 de caractere).` });
      return;
    }

    const birthDateResult = parseBirthDateCell(rawCells[1]);
    if ("error" in birthDateResult) {
      issues.push({ rowNumber, reason: `${fullName}: ${birthDateResult.error}.` });
      return;
    }

    const birthLocality = capField(localityRaw, 255);
    const birthCounty = capField(countyRaw, 255);
    const address = addressRaw.trim() || null;
    const homeChurch = capField(churchRaw, 255);
    const phone = capField(phoneRaw, 30);

    rows.push({
      rowNumber,
      fullName,
      birthDate: birthDateResult.value,
      birthLocality,
      birthCounty,
      address,
      homeChurch,
      phone,
    });
  });

  return { rows, issues };
}
