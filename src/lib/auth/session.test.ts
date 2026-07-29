import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hashToken } from "./session";

// `db.delete(...).where(...)` — lanțul minim pe care îl folosește `cleanupExpired`.
const whereSpy = vi.fn();
vi.mock("@/db", () => ({
  db: { delete: () => ({ where: whereSpy }) },
}));

describe("hashToken", () => {
  it("produces a deterministic sha256 hex digest", () => {
    expect(hashToken("token-de-test")).toBe(
      hashToken("token-de-test")
    );
  });

  it("produces different hashes for different tokens", () => {
    expect(hashToken("token-a")).not.toBe(hashToken("token-b"));
  });

  it("never returns the raw token itself (defense in depth if DB leaks)", () => {
    const token = "raw-secret-cookie-value";
    expect(hashToken(token)).not.toBe(token);
  });

  it("returns a 64-char hex string", () => {
    expect(hashToken("anything")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("cleanupExpired", () => {
  beforeEach(() => {
    vi.resetModules(); // `lastCleanupAt` e stare de modul — fiecare test pornește de la zero
    whereSpy.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("șterge sesiunile și rate-limit-urile expirate la prima rulare", async () => {
    const { cleanupExpired } = await import("./session");
    await cleanupExpired();
    expect(whereSpy).toHaveBeenCalledTimes(2); // sessions + rate_limit_attempts
  });

  it("nu repetă curățarea la apeluri consecutive (throttle 1h)", async () => {
    const { cleanupExpired } = await import("./session");
    await cleanupExpired();
    await cleanupExpired();
    await cleanupExpired();
    expect(whereSpy).toHaveBeenCalledTimes(2);
  });

  it("curăță din nou după ce a trecut intervalul", async () => {
    const { cleanupExpired } = await import("./session");
    await cleanupExpired();
    vi.advanceTimersByTime(1000 * 60 * 61);
    await cleanupExpired();
    expect(whereSpy).toHaveBeenCalledTimes(4);
  });
});
