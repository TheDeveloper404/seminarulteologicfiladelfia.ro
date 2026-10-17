import { beforeEach, expect, it, vi } from "vitest";

const { admin, student, select, denied } = vi.hoisted(() => ({
  admin: vi.fn(), student: vi.fn(), select: vi.fn(), denied: new Error("access denied"),
}));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: admin }));
vi.mock("@/lib/auth/require-student", () => ({ requireStudent: student }));
vi.mock("@/db", () => ({ db: { select } }));

const pages = [
  { role: "admin", load: () => import("../../app/admin/(protected)/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/studenti/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/studenti/[id]/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/studenti/[id]/note/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/studenti/nou/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/studenti/import/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/absolventi/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/materiale/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/galerie/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/galerie/[id]/page") },
  { role: "admin", load: () => import("../../app/admin/(protected)/taxe/page") },
  { role: "student", load: () => import("../../app/portal/(protected)/page") },
  { role: "student", load: () => import("../../app/portal/(protected)/materiale/page") },
  { role: "student", load: () => import("../../app/portal/(protected)/note/page") },
  { role: "student", load: () => import("../../app/portal/(protected)/prezenta/page") },
  { role: "student", load: () => import("../../app/portal/(protected)/taxe/page") },
];

beforeEach(() => {
  vi.clearAllMocks();
  admin.mockRejectedValue(denied);
  student.mockRejectedValue(denied);
  select.mockImplementation(() => { throw new Error("private query before authorization"); });
});

// "verifica ca rutele sa fie protejate si sa nu existe vreun bypass"
it.each(pages)("denies $role page before any private query or serialization ($load)", async ({ role, load }) => {
  const page = await load();
  const render = page.default as (props: unknown) => Promise<unknown>;
  await expect(render({ params: Promise.resolve({ id: "1" }), searchParams: Promise.resolve({}) })).rejects.toBe(denied);
  expect(role === "admin" ? admin : student).toHaveBeenCalled();
  expect(select).not.toHaveBeenCalled();
});

// "verifica ca rutele sa fie protejate si sa nu existe vreun bypass"
it.each([
  () => import("../../app/admin/(protected)/studenti/[id]/note/page"),
  () => import("../../app/admin/(protected)/galerie/[id]/page"),
])("denies dynamic metadata before its private query (%s)", async (load) => {
  const page = await load();
  await expect(page.generateMetadata({ params: Promise.resolve({ id: "1" }) })).rejects.toBe(denied);
  expect(admin).toHaveBeenCalled();
  expect(select).not.toHaveBeenCalled();
});
