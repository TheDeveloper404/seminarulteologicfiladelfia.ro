import { describe, expect, it } from "vitest";
import { hashToken } from "./session";

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
