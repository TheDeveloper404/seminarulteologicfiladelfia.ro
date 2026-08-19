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

const readFileMock = vi.fn();
vi.mock("@/lib/course-materials/storage", () => ({
  readCourseMaterialFile: (filePath: string) => readFileMock(filePath),
}));

const { GET } = await import("./route");

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/materiale/[id] — published gate", () => {
  beforeEach(() => {
    selectMock.mockReset();
    getSessionMock.mockReset();
    readFileMock.mockReset();
    readFileMock.mockResolvedValue(Buffer.from("pdf-bytes"));
  });

  it("returns 401 when neither admin nor student is authenticated", async () => {
    getSessionMock.mockResolvedValue(null);
    const res = await GET(new Request("http://x"), params("1"));
    expect(res.status).toBe(401);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("404s an unpublished material for a student session (published gate)", async () => {
    getSessionMock.mockImplementation(async (role: string) => (role === "student" ? { id: "s" } : null));
    selectMock.mockResolvedValue([{ id: 1, published: false, filePath: "x", originalFileName: "x.pdf" }]);
    const res = await GET(new Request("http://x"), params("1"));
    expect(res.status).toBe(404);
    expect(readFileMock).not.toHaveBeenCalled();
  });

  it("serves an unpublished material for an admin session", async () => {
    getSessionMock.mockImplementation(async (role: string) => (role === "admin" ? { id: "a" } : null));
    selectMock.mockResolvedValue([{ id: 1, published: false, filePath: "x", originalFileName: "x.pdf" }]);
    const res = await GET(new Request("http://x"), params("1"));
    expect(res.status).toBe(200);
    expect(readFileMock).toHaveBeenCalledWith("x");
  });

  it("serves a published material for a student session", async () => {
    getSessionMock.mockImplementation(async (role: string) => (role === "student" ? { id: "s" } : null));
    selectMock.mockResolvedValue([{ id: 1, published: true, filePath: "x", originalFileName: "x.pdf" }]);
    const res = await GET(new Request("http://x"), params("1"));
    expect(res.status).toBe(200);
  });

  it("404s on a non-integer id without querying the db", async () => {
    getSessionMock.mockResolvedValue({ id: "a" });
    const res = await GET(new Request("http://x"), params("abc"));
    expect(res.status).toBe(404);
    expect(selectMock).not.toHaveBeenCalled();
  });
});
