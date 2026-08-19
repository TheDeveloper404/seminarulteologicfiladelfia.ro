import { describe, expect, it, vi, beforeEach } from "vitest";

// isRateLimited face un singur round-trip la DB (upsert atomic) și interpretează `count`
// întors de Postgres. Mock-uim la nivelul acelui round-trip ca să testăm pragul de decizie
// (count > maxAttempts) fără o bază de date reală.
const executeMock = vi.fn();
vi.mock("@/db", () => ({
  db: { execute: (...args: unknown[]) => executeMock(...args) },
}));

// `headers()` din next/headers — mock-uit ca să putem simula cereri cu headere falsificate.
const mockHeaders = new Map<string, string>();
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (k: string) => mockHeaders.get(k.toLowerCase()) ?? null }),
}));

const { isRateLimited, clearRateLimit, getClientIp } = await import("./rate-limit");

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

// Regresie pentru findingul din auditul runda 6: dacă `getClientIp` ar lua primul element din
// `x-forwarded-for`, oricine ar putea trimite un IP inventat la fiecare cerere și ar primi o
// cheie nouă de rate limit de fiecare dată — adică brute-force nelimitat pe login.
describe("getClientIp — rezistență la falsificare", () => {
  beforeEach(() => {
    mockHeaders.clear();
  });

  it("ignoră IP-ul injectat de client în x-forwarded-for și îl ia pe cel adăugat de proxy", async () => {
    mockHeaders.set("x-forwarded-for", "203.0.113.77, 82.77.22.107");
    expect(await getClientIp()).toBe("82.77.22.107");
  });

  // Audit 2026-08-19, SEC-001: nu mai avem încredere DIRECTĂ în cf-connecting-ip la nivel de
  // aplicație — un atacator care se conectează direct la origin (ocolind Cloudflare) putea
  // trimite orice valoare pe acest header și obținea o cheie nouă de rate-limit la fiecare
  // cerere. Verificarea de proveniență se mută la nginx (ngx_http_realip_module); aplicația
  // are încredere doar în x-real-ip, pe care nginx îl calculează după acea verificare.
  it("ignoră cf-connecting-ip la nivel de aplicație și cade pe x-real-ip", async () => {
    mockHeaders.set("cf-connecting-ip", "9.9.9.9");
    mockHeaders.set("x-real-ip", "82.77.22.107");
    mockHeaders.set("x-forwarded-for", "203.0.113.77, 198.51.100.42");
    expect(await getClientIp()).toBe("82.77.22.107");
  });

  it("cade pe x-real-ip (pus de nginx) când nu vine prin Cloudflare", async () => {
    mockHeaders.set("x-real-ip", "82.77.22.107");
    mockHeaders.set("x-forwarded-for", "203.0.113.77");
    expect(await getClientIp()).toBe("82.77.22.107");
  });

  it("returnează 'unknown' când nu există niciun header de proxy", async () => {
    expect(await getClientIp()).toBe("unknown");
  });
});

describe("clearRateLimit", () => {
  beforeEach(() => {
    executeMock.mockReset();
    executeMock.mockResolvedValue({ rows: [] });
  });

  // Apelat după un login reușit: fără el, studenții din spatele aceluiași IP (wifi-ul
  // seminarului) consumau reciproc cele 5 încercări și se blocau unii pe alții.
  it("issues a delete scoped to the given key", async () => {
    await clearRateLimit("student-login:1.2.3.4");

    expect(executeMock).toHaveBeenCalledTimes(1);
    const query = executeMock.mock.calls[0][0] as { queryChunks?: unknown[] };
    const sqlText = JSON.stringify(query);
    expect(sqlText).toContain("DELETE FROM rate_limit_attempts");
    expect(sqlText).toContain("student-login:1.2.3.4");
  });
});
