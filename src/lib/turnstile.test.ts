import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "./turnstile";

const originalSecret = process.env.TURNSTILE_SECRET_KEY;

afterEach(() => {
  process.env.TURNSTILE_SECRET_KEY = originalSecret;
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("verifyTurnstileToken", () => {
  it("skips verification (returns true) outside production when TURNSTILE_SECRET_KEY is not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(await verifyTurnstileToken("any-token", "1.2.3.4")).toBe(true);
  });

  it("fails closed (throws) in production when TURNSTILE_SECRET_KEY is not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    vi.stubEnv("NODE_ENV", "production");
    await expect(verifyTurnstileToken("any-token", "1.2.3.4")).rejects.toThrow();
  });

  it("rejects a missing token when the secret key is configured", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    expect(await verifyTurnstileToken(null, "1.2.3.4")).toBe(false);
  });

  it("returns true when Cloudflare confirms success", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ success: true }) })
    );
    expect(await verifyTurnstileToken("valid-token", "1.2.3.4")).toBe(true);
  });

  it("returns false when Cloudflare rejects the token", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ success: false }) })
    );
    expect(await verifyTurnstileToken("bad-token", "1.2.3.4")).toBe(false);
  });
});
