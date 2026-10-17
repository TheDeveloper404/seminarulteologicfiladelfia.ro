import { beforeEach, describe, expect, it, vi } from "vitest";
import { attendance } from "@/db/schema";

const mocks = vi.hoisted(() => ({
  admin: vi.fn(), insert: vi.fn(), values: vi.fn(), upsert: vi.fn(), revalidate: vi.fn(),
}));
vi.mock("@/db", () => ({ db: { insert: mocks.insert } }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.admin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

const { setAttendance } = await import("./actions");

beforeEach(() => {
  vi.resetAllMocks();
  mocks.admin.mockResolvedValue({ adminId: 1 });
  mocks.insert.mockReturnValue({ values: mocks.values });
  mocks.values.mockReturnValue({ onConflictDoUpdate: mocks.upsert });
  mocks.upsert.mockResolvedValue(undefined);
});

describe("setAttendance", () => {
  // await requireAdmin();
  it("should propagate admin rejection before date validation or database access", async () => {
    const denied = new Error("admin guard rejected");
    mocks.admin.mockRejectedValue(denied);

    await expect(setAttendance(7, "invalid date", true)).rejects.toBe(denied);

    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it.each(["2026-02-31", "2026-13-01", "2026-1-01", "", "2026-10-17' OR 1=1--"])(
    "should reject invalid session date %s without writing", async (sessionDate) => {
      await expect(setAttendance(7, sessionDate, true)).rejects.toThrow("Format de dată invalid.");

      expect(mocks.admin).toHaveBeenCalledOnce();
      expect(mocks.insert).not.toHaveBeenCalled();
      expect(mocks.revalidate).not.toHaveBeenCalled();
    },
  );

  // Secventa select-then-insert permite doua randuri contradictorii pentru acelasi student/data la cereri concurente; schema nu impune unicitate.
  it.each([true, false])("should atomically set present=%s for the student/date pair", async (present) => {
    await setAttendance(7, "2026-10-17", present);

    expect(mocks.admin).toHaveBeenCalledOnce();
    expect(mocks.insert).toHaveBeenCalledExactlyOnceWith(attendance);
    expect(mocks.values).toHaveBeenCalledExactlyOnceWith({ studentId: 7, sessionDate: "2026-10-17", present });
    expect(mocks.upsert).toHaveBeenCalledExactlyOnceWith({
      target: [attendance.studentId, attendance.sessionDate], set: { present },
    });
    expect(mocks.revalidate).toHaveBeenCalledExactlyOnceWith("/admin/studenti");
  });

  // Secventa select-then-insert permite doua randuri contradictorii pentru acelasi student/data la cereri concurente; schema nu impune unicitate.
  it("should send the requested value on repeated corrections instead of toggling", async () => {
    for (const present of [true, true, false, false]) {
      await setAttendance(7, "2026-10-17", present);
    }

    expect(mocks.upsert.mock.calls.map(([options]) => options.set)).toEqual([
      { present: true }, { present: true }, { present: false }, { present: false },
    ]);
  });

  it("should wait for persistence before invalidating the attendance page", async () => {
    let complete!: () => void;
    mocks.upsert.mockReturnValue(new Promise<void>((resolve) => { complete = resolve; }));
    const pending = setAttendance(7, "2026-10-17", true);
    await vi.waitFor(() => expect(mocks.upsert).toHaveBeenCalledOnce());
    expect(mocks.revalidate).not.toHaveBeenCalled();

    complete();
    await pending;

    expect(mocks.revalidate).toHaveBeenCalledExactlyOnceWith("/admin/studenti");
  });

  it("should avoid cache invalidation when the write fails", async () => {
    const failure = new Error("fixture database failure");
    mocks.upsert.mockRejectedValue(failure);

    await expect(setAttendance(7, "2026-10-17", true)).rejects.toBe(failure);

    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
