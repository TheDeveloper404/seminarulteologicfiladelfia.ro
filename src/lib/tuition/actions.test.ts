import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { studentTuition, tuitionMonths } from "@/db/schema";

const mocks = vi.hoisted(() => ({
  admin: vi.fn(), transaction: vi.fn(), insert: vi.fn(), values: vi.fn(),
  conflict: vi.fn(), monthReturning: vi.fn(), execute: vi.fn(),
  update: vi.fn(), set: vi.fn(),
  where: vi.fn(), returning: vi.fn(), revalidate: vi.fn(), redirect: vi.fn(),
}));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.admin }));
vi.mock("@/db", () => ({ db: { transaction: mocks.transaction, update: mocks.update } }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

const { createTuitionMonth, setTuitionPaid } = await import("./actions");
const redirectSignal = new Error("mock redirect control flow");
const dialect = new PgDialect();
function form(month: string | null = "2026-10") {
  const data = new FormData();
  if (month !== null) data.set("month", month);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.admin.mockResolvedValue({ role: "admin" });
  mocks.redirect.mockImplementation(() => { throw redirectSignal; });
  mocks.monthReturning.mockResolvedValue([{ id: 17 }]);
  mocks.conflict.mockReturnValue({ returning: mocks.monthReturning });
  mocks.values.mockReturnValue({ onConflictDoNothing: mocks.conflict });
  mocks.execute.mockResolvedValue(undefined);
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.transaction.mockImplementation(async (callback) => callback({
    insert: mocks.insert, execute: mocks.execute,
  }));
  mocks.returning.mockResolvedValue([{ id: 31 }]);
  mocks.where.mockReturnValue({ returning: mocks.returning });
  mocks.set.mockReturnValue({ where: mocks.where });
  mocks.update.mockReturnValue({ set: mocks.set });
});

describe("createTuitionMonth", () => {
  // adminul gestioneaza taxele, iar studentul vede doar situatia proprie
  it("should reject before reading input or accessing the database when admin authorization fails", async () => {
    const denied = new Error("admin guard rejected");
    mocks.admin.mockRejectedValue(denied);
    const data = form();
    const get = vi.spyOn(data, "get");
    await expect(createTuitionMonth(null, data)).rejects.toBe(denied);
    expect(get).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it.each([null, "", "2026-1", "2026-00", "2026-13", "0999-12", "0000-01", "10000-01", "2026-10-01", " 2026-10", "2026-10 ", "2026-10' OR 1=1--"])(
    "should reject malformed month %s without a transaction", async (month) => {
      expect(await createTuitionMonth(null, form(month))).toMatchObject({ error: expect.any(String) });
      expect(mocks.admin).toHaveBeenCalledOnce();
      expect(mocks.transaction).not.toHaveBeenCalled();
      expect(mocks.redirect).not.toHaveBeenCalled();
      expect(mocks.revalidate).not.toHaveBeenCalled();
    },
  );

  it("should reject a file submitted as the month without a transaction", async () => {
    const data = form();
    data.set("month", new File(["2026-10"], "month.txt"));
    expect(await createTuitionMonth(null, data)).toMatchObject({ error: expect.any(String) });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  // server amount fixed60
  it.each(["1000-01", "2026-10", "9999-12"])("should store month %s with the fixed server amount despite client manipulation", async (month) => {
    const data = form(month);
    data.set("amount", "0.01");
    await expect(createTuitionMonth(null, data)).rejects.toBe(redirectSignal);
    expect(mocks.values).toHaveBeenCalledExactlyOnceWith({ month: `${month}-01`, amount: 60 });
    expect(mocks.conflict).toHaveBeenCalledWith({ target: tuitionMonths.month });
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.revalidate.mock.calls).toEqual([["/admin/taxe"], ["/portal/taxe"]]);
    expect(mocks.redirect).toHaveBeenCalledWith(`/admin/taxe?luna=${month}`);
  });

  // fiecare luna include studentii neabsolventi existenti la creare, iar inscrierile ulterioare nu modifica lunile deja create
  it("should snapshot only current non-graduates through the same transaction", async () => {
    await expect(createTuitionMonth(null, form())).rejects.toBe(redirectSignal);
    expect(mocks.insert).toHaveBeenCalledExactlyOnceWith(tuitionMonths);
    expect(mocks.execute).toHaveBeenCalledOnce();
    const snapshot = dialect.sqlToQuery(mocks.execute.mock.calls[0][0] as SQL);
    expect(snapshot.sql.replace(/\s+/g, " ").trim()).toBe(
      'insert into "student_tuition" ("month_id", "student_id") select $1, "students"."id" from "students" where "students"."graduated" = $2',
    );
    expect(snapshot.params).toEqual([17, false]);
  });

  // Aceeasi luna nu poate fi adaugata de doua ori.
  it("should stop before inserting student fees when the month already exists", async () => {
    mocks.monthReturning.mockResolvedValue([]);
    expect(await createTuitionMonth(null, form())).toEqual({ error: "Luna este deja adăugată." });
    expect(mocks.insert).toHaveBeenCalledExactlyOnceWith(tuitionMonths);
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it.each(["month", "student fees"])("should return a generic error when inserting %s fails", async (stage) => {
    const failure = new Error("private database host password SQL details");
    if (stage === "month") mocks.monthReturning.mockRejectedValue(failure);
    else mocks.execute.mockRejectedValue(failure);
    const result = await createTuitionMonth(null, form());
    expect(result).toEqual({ error: "Luna nu a putut fi adăugată. Încearcă din nou." });
    expect(JSON.stringify(result)).not.toContain(failure.message);
    expect(mocks.revalidate).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe("setTuitionPaid", () => {
  // adminul gestioneaza taxele, iar studentul vede doar situatia proprie
  it("should propagate authorization rejection before validating or mutating", async () => {
    const denied = new Error("admin guard rejected");
    mocks.admin.mockRejectedValue(denied);
    await expect(setTuitionPaid(0, "true" as unknown as boolean, null, form())).rejects.toBe(denied);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "31", null, undefined])("should reject invalid fee ID %s", async (id) => {
    expect(await setTuitionPaid(id as number, true, null, form())).toMatchObject({ error: expect.any(String) });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each(["true", "false", 1, 0, null, undefined])("should reject non-boolean paid value %s", async (paid) => {
    expect(await setTuitionPaid(31, paid as unknown as boolean, null, form())).toMatchObject({ error: expect.any(String) });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  // adminul gestioneaza taxele, iar studentul vede doar situatia proprie
  it.each([true, false])("should explicitly set paid=%s on repeated requests instead of toggling", async (paid) => {
    const data = form();
    data.set("paid", String(!paid));
    data.set("feeId", "999");
    for (let request = 0; request < 2; request++) {
      expect(await setTuitionPaid(31, paid, null, data)).toEqual({ success: "Plata a fost actualizată." });
    }
    expect(mocks.update).toHaveBeenCalledWith(studentTuition);
    expect(mocks.set.mock.calls).toEqual([[{ paid }], [{ paid }]]);
    const predicate = dialect.sqlToQuery(mocks.where.mock.calls[0][0] as SQL);
    expect(predicate.sql).toContain('"student_tuition"."id"');
    expect(predicate.params).toEqual([31]);
    expect(mocks.revalidate.mock.calls).toEqual([["/admin/taxe"], ["/portal/taxe"], ["/admin/taxe"], ["/portal/taxe"]]);
  });

  it("should report a missing fee without revalidating", async () => {
    mocks.returning.mockResolvedValue([]);
    expect(await setTuitionPaid(31, true, null, form())).toEqual({ error: "Plata nu a fost găsită." });
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("should hide database details when updating fails", async () => {
    const failure = new Error("private database host password SQL details");
    mocks.returning.mockRejectedValue(failure);
    const result = await setTuitionPaid(31, true, null, form());
    expect(result).toEqual({ error: "Plata nu a putut fi actualizată. Încearcă din nou." });
    expect(JSON.stringify(result)).not.toContain(failure.message);
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
