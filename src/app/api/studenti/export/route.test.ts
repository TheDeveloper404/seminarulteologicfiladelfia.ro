import { beforeEach, describe, expect, it, vi } from "vitest";
import ExcelJS from "exceljs";

const { selectMock, getSessionMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => ({ orderBy: () => selectMock() }) }),
    }),
  },
}));
vi.mock("@/lib/auth/session", () => ({ getSession: getSessionMock }));

import { GET } from "./route";

describe("GET /api/studenti/export", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // "Fisierul Excel va fi generat pe server, cu verificarea sesiunii admin existente"
  it("refuses unauthenticated visitors and student-only sessions", async () => {
    getSessionMock.mockImplementation(async (role: string) =>
      role === "student" ? { id: "student" } : null
    );
    const response = await GET();
    expect(getSessionMock).toHaveBeenCalledWith("admin");
    expect(response.status).toBe(401);
    expect(selectMock).not.toHaveBeenCalled();
  });

  // "la export excel, scoate coloana cu nr matricol si pune in schimb 1,2,3,4... etc..."
  // "la export excel pt prezenta. sa apara data si sa fie titlul tabel prezenta" (Liviu, 2026-11-21)
  it("creates a readable Excel file with title, export date, the requested columns and typed values", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    // 20 nov 22:30 UTC = 21 nov 00:30 la București — data exportului e 21.11.2026.
    vi.setSystemTime(new Date("2026-11-20T22:30:00Z"));
    getSessionMock.mockResolvedValue({ id: "admin" });
    selectMock.mockResolvedValue([
      { fullName: "Ștefan Ion", enrollmentYear: 2024, studyYear: 2 },
      { fullName: "=1+1", enrollmentYear: 2026, studyYear: 1 },
    ]);
    const response = await GET();
    vi.useRealTimers();
    expect(response.headers.get("Content-Disposition")).toContain("studenti.xlsx");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    const sheet = workbook.worksheets[0];
    expect(sheet.columnCount).toBe(4);
    expect(sheet.rowCount).toBe(6);
    expect(sheet.getCell("A1").value).toBe("Tabel prezență");
    expect(sheet.getCell("A2").value).toBe("Data: 21.11.2026");
    expect(sheet.getRow(4).values).toEqual([
      undefined, "Nr. crt.", "Nume", "Anul înscrierii", "Anul curent de studiu",
    ]);
    expect(sheet.getRow(5).values).toEqual([undefined, 1, "Ștefan Ion", 2024, 2]);
    expect(sheet.getCell("A6").value).toBe(2);
    expect(sheet.getCell("B6").type).toBe(ExcelJS.ValueType.String);
    expect(sheet.getCell("B6").value).toBe("=1+1");
  });

  it("exports an empty list with title, date and column headers", async () => {
    getSessionMock.mockResolvedValue({ id: "admin" });
    selectMock.mockResolvedValue([]);
    const response = await GET();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await response.arrayBuffer());
    expect(workbook.worksheets[0].rowCount).toBe(4);
  });

  it("returns a generic error when the database fails", async () => {
    getSessionMock.mockResolvedValue({ id: "admin" });
    selectMock.mockRejectedValue(new Error("private database details"));
    const response = await GET();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Exportul a eșuat." });
  });
});
