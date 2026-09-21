import { describe, expect, it } from "vitest";
import { isValidSessionDate, todaySessionDate } from "./session-date";

describe("isValidSessionDate", () => {
  it("acceptă date reale", () => {
    expect(isValidSessionDate("2026-09-21")).toBe(true);
    expect(isValidSessionDate("2028-02-29")).toBe(true); // an bisect
  });

  it("respinge formate greșite", () => {
    expect(isValidSessionDate("")).toBe(false);
    expect(isValidSessionDate("abc")).toBe(false);
    expect(isValidSessionDate("21/09/2026")).toBe(false);
    expect(isValidSessionDate("2026-9-1")).toBe(false);
  });

  it("respinge date inexistente care trec de regex", () => {
    expect(isValidSessionDate("2026-02-31")).toBe(false);
    expect(isValidSessionDate("2027-02-29")).toBe(false); // nu e an bisect
    expect(isValidSessionDate("2026-13-01")).toBe(false);
    expect(isValidSessionDate("2026-00-10")).toBe(false);
  });
});

describe("todaySessionDate", () => {
  it("folosește fusul orar Europe/Bucharest, nu UTC", () => {
    // 23:30 UTC pe 20 sept = 02:30 pe 21 sept în România (vara, UTC+3).
    expect(todaySessionDate(new Date("2026-09-20T23:30:00Z"))).toBe("2026-09-21");
    // 21:30 UTC pe 20 sept = 00:30 pe 21 sept în România.
    expect(todaySessionDate(new Date("2026-09-20T21:30:00Z"))).toBe("2026-09-21");
    // 20:30 UTC pe 20 sept = 23:30 pe 20 sept în România.
    expect(todaySessionDate(new Date("2026-09-20T20:30:00Z"))).toBe("2026-09-20");
  });

  it("întoarce mereu formatul YYYY-MM-DD", () => {
    expect(todaySessionDate(new Date("2026-01-05T12:00:00Z"))).toBe("2026-01-05");
  });
});
