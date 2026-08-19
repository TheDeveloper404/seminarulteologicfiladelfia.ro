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

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

const { getSession } = await import("./session");

describe("getSession", () => {
  beforeEach(() => {
    selectMock.mockReset();
    cookieStore.get.mockReset();
  });

  it("returns null when there is no session cookie", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await getSession("admin")).toBeNull();
    // Nicio interogare DB pentru un token inexistent — verificarea se oprește devreme.
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("returns null when no row matches the token+role pair", async () => {
    // Simulează exact cazul relevant pentru autorizare: un cookie de student nu poate
    // satisface `getSession("admin")` — interogarea filtrează pe `role`, deci un rând cu alt
    // rol decât cel cerut nu se potrivește niciodată (`eq(sessions.role, role)` în session.ts).
    cookieStore.get.mockReturnValue({ value: "some-token" });
    selectMock.mockResolvedValue([]);
    expect(await getSession("admin")).toBeNull();
  });

  it("returns null when the matching row is expired", async () => {
    cookieStore.get.mockReturnValue({ value: "some-token" });
    selectMock.mockResolvedValue([
      { id: "hash", role: "admin", adminId: 1, studentId: null, expiresAt: new Date(Date.now() - 1000) },
    ]);
    expect(await getSession("admin")).toBeNull();
  });

  it("returns the session when a matching, non-expired row is found", async () => {
    cookieStore.get.mockReturnValue({ value: "some-token" });
    const row = { id: "hash", role: "admin" as const, adminId: 1, studentId: null, expiresAt: new Date(Date.now() + 1000) };
    selectMock.mockResolvedValue([row]);
    expect(await getSession("admin")).toEqual(row);
  });
});
