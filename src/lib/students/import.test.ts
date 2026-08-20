import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { parseBirthDateCell, parseRegistryFile } from "./import";
import { REGISTRY_COLUMNS } from "./registry-columns";

async function buildXlsxBuffer(rows: (string | number)[][]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Registru");
  sheet.addRow(REGISTRY_COLUMNS as unknown as string[]);
  for (const row of rows) sheet.addRow(row);
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

describe("parseBirthDateCell", () => {
  it("accepts an empty cell as no birth date", () => {
    expect(parseBirthDateCell(null)).toEqual({ value: null });
    expect(parseBirthDateCell("")).toEqual({ value: null });
  });

  it("accepts a JS Date value (Excel native date cell)", () => {
    const result = parseBirthDateCell(new Date("1998-03-12T00:00:00.000Z"));
    expect(result).toEqual({ value: "1998-03-12" });
  });

  it("accepts dd.mm.yyyy text", () => {
    expect(parseBirthDateCell("12.03.1998")).toEqual({ value: "1998-03-12" });
  });

  it("accepts yyyy-mm-dd text", () => {
    expect(parseBirthDateCell("1998-03-12")).toEqual({ value: "1998-03-12" });
  });

  it("rejects an unrecognized format", () => {
    const result = parseBirthDateCell("martie 1998");
    expect("error" in result).toBe(true);
  });
});

describe("parseRegistryFile", () => {
  it("parses valid rows with all columns filled", async () => {
    const buffer = await buildXlsxBuffer([
      ["Popescu Ion", "12.03.1998", "Petroșani", "Hunedoara", "Str. Exemplu 1", "Biserica Filadelfia", "0712345678"],
    ]);

    const { rows, issues } = await parseRegistryFile(buffer, "registru.xlsx");

    expect(issues).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      fullName: "Popescu Ion",
      birthDate: "1998-03-12",
      birthLocality: "Petroșani",
      birthCounty: "Hunedoara",
      address: "Str. Exemplu 1",
      homeChurch: "Biserica Filadelfia",
      phone: "0712345678",
    });
  });

  it("allows every optional column to be blank, keeping only the name", async () => {
    const buffer = await buildXlsxBuffer([["Ionescu Maria", "", "", "", "", "", ""]]);

    const { rows, issues } = await parseRegistryFile(buffer, "registru.xlsx");

    expect(issues).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      fullName: "Ionescu Maria",
      birthDate: null,
      birthLocality: null,
      birthCounty: null,
      address: null,
      homeChurch: null,
      phone: null,
    });
  });

  it("skips fully blank rows silently", async () => {
    const buffer = await buildXlsxBuffer([
      ["Popescu Ion", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
    ]);

    const { rows, issues } = await parseRegistryFile(buffer, "registru.xlsx");

    expect(rows).toHaveLength(1);
    expect(issues).toEqual([]);
  });

  it("reports a row missing the required name as an issue, not a thrown row", async () => {
    const buffer = await buildXlsxBuffer([["", "12.03.1998", "", "", "", "", ""]]);

    const { rows, issues } = await parseRegistryFile(buffer, "registru.xlsx");

    expect(rows).toHaveLength(0);
    expect(issues).toHaveLength(1);
    expect(issues[0].reason).toMatch(/lipsește numele/i);
  });

  it("reports an invalid birth date as an issue tied to the row", async () => {
    const buffer = await buildXlsxBuffer([["Vasilescu Ana", "nu e o dată", "", "", "", "", ""]]);

    const { rows, issues } = await parseRegistryFile(buffer, "registru.xlsx");

    expect(rows).toHaveLength(0);
    expect(issues).toHaveLength(1);
    expect(issues[0].reason).toMatch(/Vasilescu Ana/);
  });

  it("skips a row with a formula-error cell instead of storing '[object Object]'", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registru");
    sheet.addRow(REGISTRY_COLUMNS as unknown as string[]);
    const row = sheet.addRow(["Georgescu Radu", "", "", "", "", "", ""]);
    // O celulă cu eroare de formulă reală (ex. #REF! după ștergerea unei coloane în Excel) —
    // ExcelJS o reprezintă ca { error: "#REF!" }, nu ca text.
    row.getCell(3).value = { error: "#REF!" };
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const { rows, issues } = await parseRegistryFile(buffer, "registru.xlsx");

    expect(rows).toHaveLength(0);
    expect(issues).toHaveLength(1);
    expect(issues[0].reason).toMatch(/#REF!/);
    expect(issues[0].reason).not.toMatch(/object Object/);
  });
});
