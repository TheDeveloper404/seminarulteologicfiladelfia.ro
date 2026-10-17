import { describe, expect, it, vi, beforeEach } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const selectMock = vi.fn();
const whereMock = vi.fn();
vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (condition: Parameters<PgDialect["sqlToQuery"]>[0]) => {
          whereMock(condition);
          return { limit: () => selectMock() };
        },
      }),
    }),
  },
}));

const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

const { getSession, hashToken } = await import("./session");

describe("getSession", () => {
  beforeEach(() => {
    selectMock.mockReset();
    whereMock.mockReset();
    cookieStore.get.mockReset();
  });

  it("returns null when there is no session cookie", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await getSession("admin")).toBeNull();
    // Nicio interogare DB pentru un token inexistent — verificarea se oprește devreme.
    expect(selectMock).not.toHaveBeenCalled();
  });

  // "Correctness also role binding/admin existing."
  it("returns null when no row matches the token+role pair", async () => {
    // Simulează exact cazul relevant pentru autorizare: un cookie de student nu poate
    // satisface `getSession("admin")` — interogarea filtrează pe `role`, deci un rând cu alt
    // rol decât cel cerut nu se potrivește niciodată (`eq(sessions.role, role)` în session.ts).
    cookieStore.get.mockReturnValue({ value: "some-token" });
    selectMock.mockResolvedValue([]);
    expect(await getSession("admin")).toBeNull();
    const query = new PgDialect().sqlToQuery(whereMock.mock.calls[0][0]);
    expect(query.sql).toContain('"sessions"."role" =');
    expect(query.params).toEqual([hashToken("some-token"), "admin"]);
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
    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  // "ensure getSession student rejects currentlygraduated/missing student"
  it.each([
    ["graduated", [{ graduated: true }]],
    ["missing", []],
  ])("rejects a stale student session when the student is %s", async (_label, students) => {
    cookieStore.get.mockReturnValue({ value: "student-token" });
    selectMock.mockResolvedValueOnce([
      { id: "hash", role: "student", studentId: 7, adminId: null, expiresAt: new Date(Date.now() + 60_000) },
    ]).mockResolvedValueOnce(students);
    expect(await getSession("student")).toBeNull();
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  // "ensure getSession student rejects currentlygraduated/missing student"
  it("rejects a student session without a bound student", async () => {
    cookieStore.get.mockReturnValue({ value: "student-token" });
    selectMock.mockResolvedValueOnce([
      { id: "hash", role: "student", studentId: null, adminId: null, expiresAt: new Date(Date.now() + 60_000) },
    ]);
    expect(await getSession("student")).toBeNull();
    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  // "ensure getSession student rejects currentlygraduated/missing student"
  it("returns an eligible student's session", async () => {
    cookieStore.get.mockReturnValue({ value: "student-token" });
    const row = { id: "hash", role: "student", studentId: 7, adminId: null, expiresAt: new Date(Date.now() + 60_000) };
    selectMock.mockResolvedValueOnce([row]).mockResolvedValueOnce([{ graduated: false }]);
    expect(await getSession("student")).toEqual(row);
    const query = new PgDialect().sqlToQuery(whereMock.mock.calls[1][0]);
    expect(query.sql).toContain('"students"."id" =');
    expect(query.params).toEqual([7]);
  });

  // "Add unit tests graduated/stale/revokedwrongrole"
  it("rejects a revoked student session without looking up eligibility", async () => {
    cookieStore.get.mockReturnValue({ value: "revoked-token" });
    selectMock.mockResolvedValueOnce([]);
    expect(await getSession("student")).toBeNull();
    expect(selectMock).toHaveBeenCalledTimes(1);
  });

  // "Add unit tests graduated/stale/revokedwrongrole"
  it("rejects an expired student session before looking up eligibility", async () => {
    cookieStore.get.mockReturnValue({ value: "expired-token" });
    selectMock.mockResolvedValueOnce([
      { id: "hash", role: "student", studentId: 7, adminId: null, expiresAt: new Date(Date.now() - 60_000) },
    ]);
    expect(await getSession("student")).toBeNull();
    expect(selectMock).toHaveBeenCalledTimes(1);
  });
});
