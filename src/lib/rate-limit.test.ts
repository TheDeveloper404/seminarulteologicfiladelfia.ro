import { describe, expect, it, vi, beforeEach } from "vitest";

// isRateLimited face un singur round-trip la DB (upsert atomic) și interpretează `count`
// întors de Postgres. Mock-uim la nivelul acelui round-trip ca să testăm pragul de decizie
// (count > maxAttempts) fără o bază de date reală.
const executeMock = vi.fn();
vi.mock("@/db", () => ({
  db: { execute: (...args: unknown[]) => executeMock(...args) },
}));

const { isRateLimited } = await import("./rate-limit");

describe("isRateLimited", () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it("does not rate limit when count is within the default max (10)", async () => {
    executeMock.mockResolvedValue({ rows: [{ count: 10 }] });
    expect(await isRateLimited("contact:1.2.3.4")).toBe(false);
  });

  it("rate limits once count exceeds the default max (10)", async () => {
    executeMock.mockResolvedValue({ rows: [{ count: 11 }] });
    expect(await isRateLimited("contact:1.2.3.4")).toBe(true);
  });

  it("respects a custom maxAttempts (stricter student-login limit of 5)", async () => {
    executeMock.mockResolvedValue({ rows: [{ count: 6 }] });
    expect(await isRateLimited("student-login:1.2.3.4", 5)).toBe(true);
  });

  it("does not rate limit at exactly the boundary (count === maxAttempts)", async () => {
    executeMock.mockResolvedValue({ rows: [{ count: 5 }] });
    expect(await isRateLimited("student-login:1.2.3.4", 5)).toBe(false);
  });
});
