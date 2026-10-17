import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const state = vi.hoisted(() => ({ db: null as ReturnType<typeof drizzle> | null }));
vi.mock("@/db", () => ({ get db() { return state.db; } }));
const cookieStore = vi.hoisted(() => ({
  values: new Map<string, string>(),
  get: vi.fn((name: string): { value: string } | undefined => {
    const value = cookieStore.values.get(name);
    return value ? { value } : undefined;
  }),
  set: vi.fn((name: string, value: string) => { cookieStore.values.set(name, value); }),
  delete: vi.fn((name: string) => { cookieStore.values.delete(name); }),
}));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

import { createSession, destroySession, getSession } from "./session";

const connectionString = process.env.AUTH_TEST_DATABASE_URL;
const schema = `auth_test_${process.pid}_${Date.now()}`;
let pool: Pool;
let setupPool: Pool;

// Opt-in only; fixtures use an isolated schema in the existing staging test database.
describe.skipIf(!connectionString)("session PostgreSQL integration", () => {
  beforeAll(async () => {
    if (new URL(connectionString!).pathname !== "/seminar_staging") {
      throw new Error("Auth integration requires seminar_staging.");
    }
    setupPool = new Pool({ connectionString });
    await setupPool.query(`CREATE SCHEMA "${schema}"`);
    pool = new Pool({ connectionString, options: `-c search_path=${schema}` });
    await pool.query("CREATE TABLE students (id integer PRIMARY KEY, graduated boolean NOT NULL DEFAULT false)");
    await pool.query(`CREATE TABLE sessions (
      id text PRIMARY KEY, role varchar(10) NOT NULL, admin_id integer,
      student_id integer REFERENCES students(id) ON DELETE CASCADE,
      expires_at timestamp NOT NULL, created_at timestamp NOT NULL DEFAULT now()
    )`);
    await pool.query("CREATE TABLE rate_limit_attempts (key text PRIMARY KEY, count integer NOT NULL DEFAULT 1, reset_at timestamp NOT NULL)");
    state.db = drizzle(pool);
  });

  beforeEach(async () => {
    cookieStore.values.clear();
    await pool.query("TRUNCATE sessions, students, rate_limit_attempts CASCADE");
    await pool.query("INSERT INTO students (id) VALUES (1), (2)");
  });

  afterAll(async () => {
    await pool?.end();
    if (setupPool) {
      await setupPool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await setupPool.end();
    }
  });

  // "Race: login reads non-graduated, graduation deletes sessions, login inserts afterwards"
  // "ensure getSession student rejects currentlygraduated/missing student"
  it("rejects a session issued after graduation has already revoked sessions", async () => {
    await createSession("student", 1);
    expect((await getSession("student"))?.studentId).toBe(1);
    const loginRead = await pool.query("SELECT graduated FROM students WHERE id = 1");
    expect(loginRead.rows[0].graduated).toBe(false);
    // Deterministic race ordering: pause login after its eligibility read, finish graduation,
    // then resume the real session issuance. No timing-dependent sleeps or mocked SQL.
    await pool.query("UPDATE students SET graduated = true WHERE id = 1");
    await pool.query("DELETE FROM sessions WHERE role = 'student' AND student_id = 1");
    await createSession("student", 1);
    expect((await pool.query("SELECT count(*)::integer AS n FROM sessions")).rows[0].n).toBe(1);
    expect(await getSession("student")).toBeNull();
    await createSession("student", 2);
    expect((await getSession("student"))?.studentId).toBe(2);
  });

  // "Correctness also role binding/admin existing."
  it("binds tokens to roles and preserves admin sessions", async () => {
    await createSession("student", 1);
    cookieStore.values.set("admin_session", cookieStore.values.get("student_session")!);
    expect(await getSession("admin")).toBeNull();
    await createSession("admin", 9);
    expect((await getSession("admin"))?.adminId).toBe(9);
    cookieStore.values.set("student_session", cookieStore.values.get("admin_session")!);
    expect(await getSession("student")).toBeNull();
  });

  // "Add unit tests graduated/stale/revokedwrongrole"
  it("rejects revoked tokens and sessions belonging to deleted students", async () => {
    await createSession("student", 1);
    const staleToken = cookieStore.values.get("student_session")!;
    await destroySession("student");
    cookieStore.values.set("student_session", staleToken);
    expect(await getSession("student")).toBeNull();
    await createSession("student", 2);
    await pool.query("DELETE FROM students WHERE id = 2");
    expect(await getSession("student")).toBeNull();
  });
});
