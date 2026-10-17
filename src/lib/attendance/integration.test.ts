import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const state = vi.hoisted(() => ({ db: null as ReturnType<typeof drizzle> | null }));
vi.mock("@/db", () => ({ get db() { return state.db; } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: async () => ({ adminId: 1 }) }));

import { setAttendance } from "./actions";

const connectionString = process.env.ATTENDANCE_TEST_DATABASE_URL;
const schema = `attendance_test_${process.pid}_${Date.now()}`;
let pool: Pool;
let setupPool: Pool;
let migration: string;

// Match the tuition integration safety boundary: opt-in, staging only, isolated schema.
describe.skipIf(!connectionString)("attendance PostgreSQL integration", () => {
  beforeAll(async () => {
    if (new URL(connectionString!).pathname !== "/seminar_staging") {
      throw new Error("Attendance integration requires seminar_staging.");
    }
    setupPool = new Pool({ connectionString });
    await setupPool.query(`CREATE SCHEMA "${schema}"`);
    pool = new Pool({ connectionString, options: `-c search_path=${schema}`, max: 4 });
    await pool.query("CREATE TABLE students (id integer PRIMARY KEY)");
    await pool.query("INSERT INTO students (id) VALUES (7), (8)");
    migration = await readFile("drizzle/0011_attendance_uniqueness.sql", "utf8");
    state.db = drizzle(pool);
  });

  beforeEach(async () => {
    await pool.query("DROP TABLE IF EXISTS attendance");
    await pool.query(`CREATE TABLE attendance (
      id serial PRIMARY KEY,
      student_id integer NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      session_date date NOT NULL,
      present boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )`);
  });

  afterAll(async () => {
    await pool?.end();
    if (setupPool) {
      await setupPool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await setupPool.end();
    }
  });

  // Secventa select-then-insert permite doua randuri contradictorii pentru acelasi student/data la cereri concurente; schema nu impune unicitate.
  it("should persist one row during concurrent opposing marks and allow explicit corrections", async () => {
    await pool.query(migration);

    await Promise.all(Array.from({ length: 12 }, (_, index) =>
      setAttendance(7, "2026-10-17", index % 2 === 0),
    ));

    const concurrent = await pool.query("SELECT id, present FROM attendance WHERE student_id = 7 AND session_date = '2026-10-17'");
    expect(concurrent.rows).toHaveLength(1);
    expect(typeof concurrent.rows[0].present).toBe("boolean");
    for (const present of [true, true, false, false]) {
      await setAttendance(7, "2026-10-17", present);
      expect((await pool.query("SELECT id, present FROM attendance")).rows).toEqual([
        { id: concurrent.rows[0].id, present },
      ]);
    }
  });

  // Secventa select-then-insert permite doua randuri contradictorii pentru acelasi student/data la cereri concurente; schema nu impune unicitate.
  it("should preserve valid history and allow distinct students and dates after migration", async () => {
    await pool.query("INSERT INTO attendance (student_id, session_date, present) VALUES (7, '2026-10-17', true)");
    const before = (await pool.query("SELECT * FROM attendance")).rows;

    await pool.query(migration);

    expect((await pool.query("SELECT * FROM attendance")).rows).toEqual(before);
    await setAttendance(8, "2026-10-17", false);
    await setAttendance(7, "2026-10-18", false);
    expect((await pool.query("SELECT count(*)::integer AS n FROM attendance")).rows[0].n).toBe(3);
    await expect(pool.query("INSERT INTO attendance (student_id, session_date, present) VALUES (7, '2026-10-17', false)"))
      .rejects.toMatchObject({ code: "23505", constraint: "attendance_student_session_unique" });
  });

  // Secventa select-then-insert permite doua randuri contradictorii pentru acelasi student/data la cereri concurente; schema nu impune unicitate.
  it.each([true, false])("should fail migration without deleting existing duplicate records when the second mark is %s", async (secondMark) => {
    await pool.query("INSERT INTO attendance (student_id, session_date, present) VALUES (7, '2026-10-17', true), (7, '2026-10-17', $1)", [secondMark]);
    const before = (await pool.query("SELECT * FROM attendance ORDER BY id")).rows;

    await expect(pool.query(migration)).rejects.toMatchObject({ code: "23505" });

    expect((await pool.query("SELECT * FROM attendance ORDER BY id")).rows).toEqual(before);
  });
});
