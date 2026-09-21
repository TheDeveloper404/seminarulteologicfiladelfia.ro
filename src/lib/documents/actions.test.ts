import { describe, expect, it, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const insertValuesMock = vi.fn();
vi.mock("@/db", () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: () => selectMock() }) }) }),
    insert: () => ({ values: (v: unknown) => insertValuesMock(v) }),
  },
}));

vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: vi.fn().mockResolvedValue({}) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const generatePdfMock = vi.fn();
vi.mock("./generate", () => ({
  generateGraduationPdf: (args: unknown) => generatePdfMock(args),
}));
vi.mock("./storage", () => ({
  saveGeneratedDocument: vi.fn().mockResolvedValue("file.pdf"),
  deleteGeneratedDocumentFile: vi.fn(),
}));

const { generateGraduationDocument } = await import("./actions");

function form(extra: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("type", "diploma");
  formData.set("issueDate", "2026-09-21");
  for (const [key, value] of Object.entries(extra)) formData.set(key, value);
  return formData;
}

const student = { id: 7, fullName: "Popescu Ion", isHistoricalImport: false, matricolNumber: 713 };

describe("generateGraduationDocument — Nr. de pe document = număr matricol", () => {
  beforeEach(() => {
    selectMock.mockReset();
    insertValuesMock.mockReset();
    generatePdfMock.mockReset().mockResolvedValue(new Uint8Array([1]));
  });

  it("tipărește și salvează numărul matricol al studentului", async () => {
    selectMock.mockResolvedValue([student]);

    const result = await generateGraduationDocument(7, null, form());

    expect(result).toEqual({ ok: true });
    expect(generatePdfMock).toHaveBeenCalledWith(expect.objectContaining({ issueNumber: "713" }));
    expect(insertValuesMock).toHaveBeenCalledWith(expect.objectContaining({ issueNumber: "713" }));
  });

  it("ignoră un issueNumber trimis de client — nu se poate tipări alt număr", async () => {
    selectMock.mockResolvedValue([student]);

    await generateGraduationDocument(7, null, form({ issueNumber: "99999" }));

    expect(generatePdfMock).toHaveBeenCalledWith(expect.objectContaining({ issueNumber: "713" }));
  });

  it("refuză generarea pentru un student fără număr matricol", async () => {
    selectMock.mockResolvedValue([{ ...student, matricolNumber: null }]);

    const result = await generateGraduationDocument(7, null, form());

    expect(result).toMatchObject({ error: expect.stringContaining("număr matricol") });
    expect(generatePdfMock).not.toHaveBeenCalled();
    expect(insertValuesMock).not.toHaveBeenCalled();
  });
});
