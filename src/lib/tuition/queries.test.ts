import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { students, studentTuition, tuitionMonths } from "@/db/schema";

const mocks = vi.hoisted(() => ({
  admin: vi.fn(), student: vi.fn(), select: vi.fn(), from: vi.fn(),
  join: vi.fn(), where: vi.fn(), limit: vi.fn(), order: vi.fn(),
}));
vi.mock("@/db", () => ({ db: { select: mocks.select } }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.admin }));
vi.mock("@/lib/auth/require-student", () => ({ requireStudent: mocks.student }));

const { getAdminTuition, getStudentTuition } = await import("./queries");
const dialect = new PgDialect();
function query(value: SQL) { return dialect.sqlToQuery(value); }
function monthRow() { return { id: 17, month: "2026-10-01", amount: 60 }; }

beforeEach(() => {
  vi.resetAllMocks();
  mocks.admin.mockResolvedValue({ role: "admin", adminId: 3 });
  mocks.student.mockResolvedValue({ role: "student", studentId: 71 });
  mocks.select.mockReturnValue({ from: mocks.from });
  mocks.from.mockReturnValue({ innerJoin: mocks.join, where: mocks.where });
  mocks.join.mockReturnValue({ where: mocks.where });
  mocks.where.mockReturnValue({ limit: mocks.limit, orderBy: mocks.order });
  mocks.limit.mockResolvedValue([monthRow()]);
  mocks.order.mockResolvedValue([]);
});

describe("getStudentTuition", () => {
  // adminul gestioneaza taxele, iar studentul vede doar situatia proprie
  it("should reject before accessing the database when student authorization fails", async () => {
    const denied = new Error("student guard rejected");
    mocks.student.mockRejectedValue(denied);
    await expect(getStudentTuition()).rejects.toBe(denied);
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  // adminul gestioneaza taxele, iar studentul vede doar situatia proprie
  it.each([71, 84])("should scope every result to authenticated student %s and sort months descending", async (studentId) => {
    mocks.student.mockResolvedValue({ role: "student", studentId });
    const rows = [{ month: "2026-10-01", amount: 60, paid: false }];
    mocks.order.mockResolvedValue(rows);
    expect(await getStudentTuition()).toEqual(rows);
    expect(mocks.student).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith({
      month: tuitionMonths.month, amount: tuitionMonths.amount, paid: studentTuition.paid,
    });
    expect(mocks.from).toHaveBeenCalledWith(studentTuition);
    expect(mocks.join.mock.calls[0][0]).toBe(tuitionMonths);
    expect(query(mocks.join.mock.calls[0][1]).sql).toBe('"student_tuition"."month_id" = "tuition_months"."id"');
    const predicate = query(mocks.where.mock.calls[0][0]);
    expect(predicate.sql).toBe('"student_tuition"."student_id" = $1');
    expect(predicate.params).toEqual([studentId]);
    expect(query(mocks.order.mock.calls[0][0]).sql).toBe('"tuition_months"."month" desc');
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  // adminul gestioneaza taxele, iar studentul vede doar situatia proprie
  it("should use the session identity even when a hostile caller supplies an extra argument", async () => {
    const hostileCall = getStudentTuition as unknown as (studentId: number) => ReturnType<typeof getStudentTuition>;
    await hostileCall(999);
    expect(query(mocks.where.mock.calls[0][0]).params).toEqual([71]);
  });

  it("should return an empty list when the student has no fees", async () => {
    expect(await getStudentTuition()).toEqual([]);
  });
});

describe("getAdminTuition", () => {
  // adminul gestioneaza taxele, iar studentul vede doar situatia proprie
  it("should reject before accessing the database when admin authorization fails", async () => {
    const denied = new Error("admin guard rejected");
    mocks.admin.mockRejectedValue(denied);
    await expect(getAdminTuition("2026-10")).rejects.toBe(denied);
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.student).not.toHaveBeenCalled();
  });

  // adminul gestioneaza taxele, iar studentul vede doar situatia proprie
  it("should load the selected month and only its student fees in name order", async () => {
    const month = monthRow();
    const rows = [{ id: 31, fullName: "Ana Popescu", paid: false }];
    mocks.order.mockResolvedValue(rows);
    expect(await getAdminTuition("2026-10")).toEqual({ month, rows });
    expect(mocks.admin).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.select).toHaveBeenCalledTimes(2);
    expect(mocks.from.mock.calls).toEqual([[tuitionMonths], [studentTuition]]);
    const monthPredicate = query(mocks.where.mock.calls[0][0]);
    expect(monthPredicate.sql).toBe('"tuition_months"."month" = $1');
    expect(monthPredicate.params).toEqual(["2026-10-01"]);
    expect(mocks.limit).toHaveBeenCalledWith(1);
    expect(mocks.select).toHaveBeenLastCalledWith({
      id: studentTuition.id, fullName: students.fullName, paid: studentTuition.paid,
    });
    expect(mocks.join.mock.calls[0][0]).toBe(students);
    expect(query(mocks.join.mock.calls[0][1]).sql).toBe('"student_tuition"."student_id" = "students"."id"');
    const feesPredicate = query(mocks.where.mock.calls[1][0]);
    expect(feesPredicate.sql).toBe('"student_tuition"."month_id" = $1');
    expect(feesPredicate.params).toEqual([17]);
    expect(query(mocks.order.mock.calls[0][0]).sql).toBe('"students"."full_name" asc');
  });

  it("should return a null month and skip the fee query when the month does not exist", async () => {
    mocks.limit.mockResolvedValue([]);
    expect(await getAdminTuition("2026-10")).toEqual({ month: null, rows: [] });
    expect(mocks.select).toHaveBeenCalledOnce();
    expect(mocks.join).not.toHaveBeenCalled();
    expect(mocks.order).not.toHaveBeenCalled();
  });

  it("should return the existing month with no rows when no students were included", async () => {
    expect(await getAdminTuition("2026-10")).toEqual({ month: monthRow(), rows: [] });
    expect(mocks.select).toHaveBeenCalledTimes(2);
  });
});
