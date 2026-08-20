import { describe, expect, it, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => selectMock(),
        }),
      }),
    }),
  },
}));

const getSessionMock = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSession: (role: "admin" | "student") => getSessionMock(role),
}));

const generatePdfMock = vi.fn();
vi.mock("@/lib/documents/generate", () => ({
  generateGraduationPdf: (args: unknown) => generatePdfMock(args),
}));

const { GET } = await import("./route");

function requestWith(params: Record<string, string>) {
  const url = new URL("http://x/api/documente/previzualizare");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return new Request(url);
}

const validStudent = {
  id: 1,
  fullName: "Popescu Ion",
  isHistoricalImport: false,
  birthDate: "1998-03-12",
};

describe("GET /api/documente/previzualizare", () => {
  beforeEach(() => {
    selectMock.mockReset();
    getSessionMock.mockReset();
    generatePdfMock.mockReset();
    generatePdfMock.mockResolvedValue(new Uint8Array([1, 2, 3]));
  });

  it("returns 401 without an admin session (a student session is not enough)", async () => {
    getSessionMock.mockResolvedValue(null);
    const res = await GET(
      requestWith({ studentId: "1", type: "diploma", issueDate: "2026-08-19" })
    );
    expect(res.status).toBe(401);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("rejects a non-integer studentId before touching the db", async () => {
    getSessionMock.mockResolvedValue({ id: "a" });
    const res = await GET(
      requestWith({ studentId: "abc", type: "diploma", issueDate: "2026-08-19" })
    );
    expect(res.status).toBe(400);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid document type", async () => {
    getSessionMock.mockResolvedValue({ id: "a" });
    const res = await GET(
      requestWith({ studentId: "1", type: "not-a-type", issueDate: "2026-08-19" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects an invalid issue date", async () => {
    getSessionMock.mockResolvedValue({ id: "a" });
    const res = await GET(
      requestWith({ studentId: "1", type: "diploma", issueDate: "not-a-date" })
    );
    expect(res.status).toBe(400);
  });

  it("404s when the student does not exist", async () => {
    getSessionMock.mockResolvedValue({ id: "a" });
    selectMock.mockResolvedValue([]);
    const res = await GET(
      requestWith({ studentId: "1", type: "diploma", issueDate: "2026-08-19" })
    );
    expect(res.status).toBe(404);
  });

  it("blocks a historical-import student row", async () => {
    getSessionMock.mockResolvedValue({ id: "a" });
    selectMock.mockResolvedValue([{ ...validStudent, isHistoricalImport: true }]);
    const res = await GET(
      requestWith({ studentId: "1", type: "diploma", issueDate: "2026-08-19" })
    );
    expect(res.status).toBe(400);
    expect(generatePdfMock).not.toHaveBeenCalled();
  });

  it("streams the PDF inline (not as a download) without an issueNumber", async () => {
    getSessionMock.mockResolvedValue({ id: "a" });
    selectMock.mockResolvedValue([validStudent]);
    const res = await GET(
      requestWith({ studentId: "1", type: "certificat", issueDate: "2026-08-19" })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toBe("inline");
    expect(generatePdfMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "certificat", issueNumber: "___" })
    );
  });
});
