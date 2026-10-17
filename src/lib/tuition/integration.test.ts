import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const state = vi.hoisted(() => ({ db: null as ReturnType<typeof drizzle> | null }));
vi.mock("@/db", () => ({ get db() { return state.db; } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: () => { throw new Error("test redirect"); } }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: async () => ({ adminId: 1 }) }));
const studentSession = vi.hoisted(() => ({ studentId: 1 }));
vi.mock("@/lib/auth/require-student", () => ({ requireStudent: async () => studentSession }));

import { createTuitionMonth, setTuitionPaid } from "./actions";
import { getAdminTuition, getStudentTuition } from "./queries";

const connectionString = process.env.TUITION_TEST_DATABASE_URL;
const schema = `tuition_test_${process.pid}_${Date.now()}`;
let pool: Pool;
let setupPool: Pool;

// Integration is opt-in and only permitted on seminar_staging. Fixtures use an isolated schema.
describe.skipIf(!connectionString)("tuition PostgreSQL integration", () => {
  beforeAll(async () => {
    if (new URL(connectionString!).pathname !== "/seminar_staging") {
      throw new Error("Tuition integration requires seminar_staging.");
    }
    setupPool = new Pool({ connectionString });
    await setupPool.query(`CREATE SCHEMA "${schema}"`);
    pool = new Pool({ connectionString, options: `-c search_path=${schema}` });
    await pool.query('CREATE TABLE students (id serial PRIMARY KEY, full_name varchar(255) NOT NULL, graduated boolean NOT NULL DEFAULT false)');
    const migration = await readFile("drizzle/0010_tuition.sql", "utf8");
    await pool.query(migration.replaceAll('"public".', `"${schema}".`));
    state.db = drizzle(pool);
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE student_tuition, tuition_months, students RESTART IDENTITY CASCADE");
    await pool.query("INSERT INTO students (full_name, graduated) VALUES ('Student A', false), ('Student B', false), ('Graduate', true)");
  });

  afterAll(async () => {
    await pool?.end();
    if (setupPool) {
      await setupPool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await setupPool.end();
    }
  });

  function form(month: string) {
    const data = new FormData();
    data.set("month", month);
    return data;
  }

  // "fiecare luna include studentii neabsolventi existenti la creare, iar inscrierile ulterioare nu modifica lunile deja create"
  // "adminul gestioneaza taxele, iar studentul vede doar situatia proprie"
  it("persists the snapshot, supports corrections and isolates student history", async () => {
    await expect(createTuitionMonth(null, form("2026-10"))).rejects.toThrow("test redirect");
    let admin = await getAdminTuition("2026-10");
    expect(admin.month?.amount).toBe(60);
    expect(admin.rows.map((row) => row.fullName)).toEqual(["Student A", "Student B"]);
    expect(admin.rows.every((row) => !row.paid)).toBe(true);
    await pool.query("INSERT INTO students (full_name) VALUES ('Late student')");
    expect(await createTuitionMonth(null, form("2026-10"))).toEqual({ error: "Luna este deja adăugată." });
    await pool.query("UPDATE students SET graduated = true WHERE id = 1");
    admin = await getAdminTuition("2026-10");
    expect(admin.rows).toHaveLength(2);
    const feeId = admin.rows[0].id;
    expect(await setTuitionPaid(feeId, true, null, new FormData())).toHaveProperty("success");
    expect(await setTuitionPaid(feeId, true, null, new FormData())).toHaveProperty("success");
    studentSession.studentId = 1;
    expect(await getStudentTuition()).toEqual([{ month: "2026-10-01", amount: 60, paid: true }]);
    studentSession.studentId = 2;
    expect(await getStudentTuition()).toEqual([{ month: "2026-10-01", amount: 60, paid: false }]);
    studentSession.studentId = 4;
    expect(await getStudentTuition()).toEqual([]);
    await setTuitionPaid(feeId, false, null, new FormData());
    studentSession.studentId = 1;
    expect((await getStudentTuition())[0].paid).toBe(false);
    expect(await getAdminTuition("2026-09")).toEqual({ month: null, rows: [] });
  });

  // "Aceeasi luna nu poate fi adaugata de doua ori."
  it("creates exactly one complete month during concurrent requests", async () => {
    const results = await Promise.allSettled([
      createTuitionMonth(null, form("2026-11")),
      createTuitionMonth(null, form("2026-11")),
    ]);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(results.filter((result) => result.status === "fulfilled")).toEqual([
      { status: "fulfilled", value: { error: "Luna este deja adăugată." } },
    ]);
    expect((await pool.query("SELECT count(*)::integer AS n FROM tuition_months")).rows[0].n).toBe(1);
    expect((await getAdminTuition("2026-11")).rows).toHaveLength(2);
  });

  // "fiecare luna include studentii neabsolventi existenti la creare"
  it("rolls back the month when the student snapshot insert fails", async () => {
    await pool.query(`CREATE FUNCTION reject_tuition() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END; $$`);
    await pool.query("CREATE TRIGGER reject_tuition BEFORE INSERT ON student_tuition FOR EACH ROW EXECUTE FUNCTION reject_tuition()");
    try {
      expect(await createTuitionMonth(null, form("2026-12"))).toHaveProperty("error");
      expect((await pool.query("SELECT count(*)::integer AS n FROM tuition_months")).rows[0].n).toBe(0);
    } finally {
      await pool.query("DROP TRIGGER reject_tuition ON student_tuition");
      await pool.query("DROP FUNCTION reject_tuition()");
    }
  });
});
