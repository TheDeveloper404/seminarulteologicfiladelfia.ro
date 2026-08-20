import { describe, expect, it, vi, beforeEach } from "vitest";

const requireAdminMock = vi.fn();
vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdminMock(),
}));

const generatePublicIdMock = vi.fn();
vi.mock("./generate-public-id", () => ({
  generateUniquePublicId: () => generatePublicIdMock(),
}));

const parseRegistryFileMock = vi.fn();
vi.mock("./import", () => ({
  parseRegistryFile: (buffer: Buffer, name: string) => parseRegistryFileMock(buffer, name),
}));

const executeMock = vi.fn();
vi.mock("@/db", () => ({
  db: { execute: (query: unknown) => executeMock(query) },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { importStudentsFromRegistry } = await import("./import-actions");

function formDataWith(fileName: string, enrollmentYear = "2026") {
  const formData = new FormData();
  const file = new File(["dummy"], fileName, { type: "application/octet-stream" });
  formData.set("file", file);
  formData.set("enrollmentYear", enrollmentYear);
  return formData;
}

function row(rowNumber: number, fullName: string) {
  return {
    rowNumber,
    fullName,
    birthDate: null,
    birthLocality: null,
    birthCounty: null,
    address: null,
    homeChurch: null,
    phone: null,
  };
}

describe("importStudentsFromRegistry — row-level resilience (code review 2026-08-20)", () => {
  beforeEach(() => {
    requireAdminMock.mockReset().mockResolvedValue({ id: "admin" });
    generatePublicIdMock.mockReset();
    parseRegistryFileMock.mockReset();
    executeMock.mockReset();
  });

  it("reports a row as a duplicate (not created) when the atomic INSERT...WHERE NOT EXISTS affects 0 rows", async () => {
    parseRegistryFileMock.mockResolvedValue({ rows: [row(2, "Popescu Ion")], issues: [] });
    generatePublicIdMock.mockResolvedValue("AB12CD");
    executeMock.mockResolvedValue({ rowCount: 0 });

    const result = await importStudentsFromRegistry(null, formDataWith("registru.xlsx"));

    expect(result).toEqual({
      created: 0,
      skipped: [
        {
          rowNumber: 2,
          reason: "Popescu Ion: există deja un student cu acest nume — nu a fost importat, verifică manual.",
        },
      ],
    });
  });

  it("counts a row as created when the insert affects 1 row", async () => {
    parseRegistryFileMock.mockResolvedValue({ rows: [row(2, "Popescu Ion")], issues: [] });
    generatePublicIdMock.mockResolvedValue("AB12CD");
    executeMock.mockResolvedValue({ rowCount: 1 });

    const result = await importStudentsFromRegistry(null, formDataWith("registru.xlsx"));

    expect(result).toEqual({ created: 1, skipped: [] });
  });

  it("does not stop the batch when one row's insert throws — the rest of the file still gets processed", async () => {
    parseRegistryFileMock.mockResolvedValue({
      rows: [row(2, "Rândul care pică"), row(3, "Rândul următor")],
      issues: [],
    });
    generatePublicIdMock.mockResolvedValue("AB12CD");
    executeMock
      .mockRejectedValueOnce(new Error("connection reset"))
      .mockResolvedValueOnce({ rowCount: 1 });

    const result = await importStudentsFromRegistry(null, formDataWith("registru.xlsx"));

    expect(result).toMatchObject({ created: 1 });
    expect((result as { skipped: { rowNumber: number; reason: string }[] }).skipped).toEqual([
      {
        rowNumber: 2,
        reason: "Rândul care pică: eroare neașteptată la salvare — rândul nu a fost importat, poți încerca din nou separat.",
      },
    ]);
    expect(executeMock).toHaveBeenCalledTimes(2);
  });
});
