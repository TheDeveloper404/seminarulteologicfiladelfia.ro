import { beforeEach, expect, it, vi } from "vitest";

const { guard, query, denied } = vi.hoisted(() => ({
  guard: vi.fn(), query: vi.fn(), denied: new Error("admin denied"),
}));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: guard }));
vi.mock("@/db", () => ({ db: { select: query, insert: query, update: query, delete: query, execute: query, transaction: query } }));

beforeEach(() => {
  vi.clearAllMocks();
  guard.mockRejectedValue(denied);
  query.mockImplementation(() => { throw new Error("database reached before authorization"); });
});

// "verifica ca rutele sa fie protejate si sa nu existe vreun bypass"
it.each([
  () => import("../students/actions"),
  () => import("../students/import-actions"),
  () => import("../attendance/actions"),
  () => import("../grades/actions"),
  () => import("../documents/actions"),
  () => import("../course-materials/actions"),
  () => import("../gallery/actions"),
  () => import("../tuition/actions"),
])("denies every exported mutation even when called directly without valid input (%s)", async (load) => {
  const actions = await load();
  for (const [name, action] of Object.entries(actions)) {
    if (typeof action !== "function") continue;
    guard.mockClear();
    await expect((action as () => Promise<unknown>)(), name).rejects.toBe(denied);
    expect(guard, name).toHaveBeenCalledOnce();
    expect(query, name).not.toHaveBeenCalled();
  }
});
