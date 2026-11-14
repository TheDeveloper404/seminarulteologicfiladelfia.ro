import { beforeEach, expect, it, vi } from "vitest";

const { notifySlack, isRateLimited, admin, send } = vi.hoisted(() => ({
  notifySlack: vi.fn<(key: string, text: string) => Promise<void>>(async () => {}),
  isRateLimited: vi.fn(),
  admin: { id: 1, passwordHash: "hash" },
  send: vi.fn(),
}));
vi.mock("@/lib/slack-alert", () => ({ notifySlack }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: async () => "203.0.113.7", isRateLimited, clearRateLimit: vi.fn() }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstileToken: async () => true }));
vi.mock("./session", () => ({ createSession: vi.fn(), destroySession: vi.fn() }));
vi.mock("bcryptjs", () => ({ default: { compare: async () => true } }));
vi.mock("@/db", () => ({
  db: { select: () => ({ from: () => ({ where: () => ({ limit: async () => [admin] }) }) }) },
}));
vi.mock("maileroo-sdk", () => ({
  MailerooClient: class { sendBasicEmail = send; },
  EmailAddress: class { constructor(public address: string) {} },
}));

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};
const adminForm = () => form({ email: "admin@exemplu.ro", password: "parola", "cf-turnstile-response": "t" });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  isRateLimited.mockResolvedValue(false);
});

it("blocarea dupa prea multe incercari trimite alerta, fara IP", async () => {
  isRateLimited.mockResolvedValue(true);
  const { loginAdmin } = await import("./admin-actions");

  expect(await loginAdmin(null, adminForm())).toEqual({ error: expect.stringContaining("Prea multe") });
  expect(notifySlack).toHaveBeenCalledWith("login-rate-limited-admin", expect.any(String));
  expect(notifySlack.mock.calls.flat().join(" ")).not.toContain("203.0.113.7");
});

it("eroare de server la login (ex. DB cazut) trimite alerta si arunca aceeasi eroare", async () => {
  const down = Object.assign(new Error("connect ECONNREFUSED"), { name: "DatabaseError" });
  isRateLimited.mockRejectedValue(down);
  const { loginAdmin } = await import("./admin-actions");

  await expect(loginAdmin(null, adminForm())).rejects.toBe(down);
  expect(notifySlack).toHaveBeenCalledWith("login-admin-error", expect.stringContaining("DatabaseError"));
});

it("login reusit (redirect) nu trimite alerta", async () => {
  const { loginAdmin } = await import("./admin-actions");

  await expect(loginAdmin(null, adminForm())).rejects.toThrow("NEXT_REDIRECT");
  expect(notifySlack).not.toHaveBeenCalled();
});

it("formular contact: emailul nu pleaca → alerta, fara datele vizitatorului", async () => {
  vi.stubEnv("MAILEROO_API_KEY", "k");
  send.mockRejectedValue(Object.assign(new Error("x"), { name: "MailerooError" }));
  const { sendContactMessage } = await import("../contact/actions");

  const result = await sendContactMessage(null, form({ name: "Ion Pop", email: "ion@exemplu.ro", phone: "", company: "", message: "Buna ziua, as dori informatii despre admitere." }));

  expect(result).toEqual({ error: expect.any(String) });
  expect(notifySlack).toHaveBeenCalledWith("contact-failed", expect.stringContaining("MailerooError"));
  const text = notifySlack.mock.calls.flat().join(" ");
  expect(text).not.toContain("ion@exemplu.ro");
  expect(text).not.toContain("Ion Pop");
  vi.unstubAllEnvs();
});
