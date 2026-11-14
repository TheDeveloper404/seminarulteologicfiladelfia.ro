import { beforeEach, expect, it, vi } from "vitest";

// Evenimentele PostHog din login/contact: emise pe ramura corecta, cu proprietati doar role/result
// (niciodata nume, email, ID sau IP).
const { trackEvent, isRateLimited, compare, send } = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  isRateLimited: vi.fn(),
  compare: vi.fn(),
  send: vi.fn(),
}));
vi.mock("@/lib/posthog-server", () => ({ trackEvent }));
vi.mock("@/lib/slack-alert", () => ({ notifySlack: vi.fn(async () => {}) }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: async () => "203.0.113.7", isRateLimited, clearRateLimit: vi.fn() }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstileToken: async () => true }));
vi.mock("@/lib/auth/session", () => ({ createSession: vi.fn(), destroySession: vi.fn() }));
vi.mock("bcryptjs", () => ({ default: { compare } }));
// admins: from().where().limit() · appSettings: from().limit() · students: from().where().limit()
vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        limit: async () => [{ sharedPasswordHash: "h" }],
        where: () => ({ limit: async () => [{ id: 7, passwordHash: "h", publicId: "SEM-001", graduated: false }] }),
      }),
    }),
  },
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
const studentForm = () => form({ publicId: "sem-001", password: "parola", "cf-turnstile-response": "t" });
const contactForm = () =>
  form({ name: "Ion Pop", email: "ion@exemplu.ro", phone: "", company: "", message: "Buna ziua, as dori informatii despre admitere." });

const sentProps = () => JSON.stringify(trackEvent.mock.calls);

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  isRateLimited.mockResolvedValue(false);
  compare.mockResolvedValue(true);
});

it("login admin reusit → login_succeeded doar cu rolul", async () => {
  const { loginAdmin } = await import("./auth/admin-actions");
  await expect(loginAdmin(null, adminForm())).rejects.toThrow("NEXT_REDIRECT");
  expect(trackEvent).toHaveBeenCalledWith("login_succeeded", { role: "admin" });
  expect(sentProps()).not.toContain("admin@exemplu.ro");
});

it("login admin cu parola gresita → login_failed doar cu rolul", async () => {
  compare.mockResolvedValue(false);
  const { loginAdmin } = await import("./auth/admin-actions");
  expect(await loginAdmin(null, adminForm())).toEqual({ error: expect.any(String) });
  expect(trackEvent).toHaveBeenCalledWith("login_failed", { role: "admin" });
  expect(trackEvent).not.toHaveBeenCalledWith("login_succeeded", expect.anything());
  expect(sentProps()).not.toContain("203.0.113.7");
});

it("login student reusit → login_succeeded doar cu rolul, fara ID", async () => {
  const { loginStudent } = await import("./auth/student-actions");
  await expect(loginStudent(null, studentForm())).rejects.toThrow("NEXT_REDIRECT");
  expect(trackEvent).toHaveBeenCalledWith("login_succeeded", { role: "student" });
  expect(sentProps()).not.toContain("SEM-001");
});

it("login student blocat de rate-limit → login_failed doar cu rolul", async () => {
  isRateLimited.mockResolvedValue(true);
  const { loginStudent } = await import("./auth/student-actions");
  expect(await loginStudent(null, studentForm())).toEqual({ error: expect.stringContaining("Prea multe") });
  expect(trackEvent).toHaveBeenCalledWith("login_failed", { role: "student" });
});

it("formular contact trimis → contact_submitted success, fara datele vizitatorului", async () => {
  vi.stubEnv("MAILEROO_API_KEY", "k");
  send.mockResolvedValue(undefined);
  const { sendContactMessage } = await import("./contact/actions");
  expect(await sendContactMessage(null, contactForm())).toEqual({ success: true });
  expect(trackEvent).toHaveBeenCalledWith("contact_submitted", { result: "success" });
  expect(sentProps()).not.toContain("ion@exemplu.ro");
  expect(sentProps()).not.toContain("Ion Pop");
});

it("formular contact: emailul nu pleaca → contact_submitted failure", async () => {
  vi.stubEnv("MAILEROO_API_KEY", "k");
  send.mockRejectedValue(new Error("x"));
  const { sendContactMessage } = await import("./contact/actions");
  expect(await sendContactMessage(null, contactForm())).toEqual({ error: expect.any(String) });
  expect(trackEvent).toHaveBeenCalledWith("contact_submitted", { result: "failure" });
});

it("formular contact fara cheie Maileroo → contact_submitted failure", async () => {
  vi.stubEnv("MAILEROO_API_KEY", "");
  const { sendContactMessage } = await import("./contact/actions");
  expect(await sendContactMessage(null, contactForm())).toEqual({ error: expect.any(String) });
  expect(trackEvent).toHaveBeenCalledWith("contact_submitted", { result: "failure" });
});

it("trackEvent: fara distinctId si fara geoip", async () => {
  const capture = vi.fn();
  vi.doMock("posthog-node", () => ({ PostHog: class { capture = capture; } }));
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
  const real = await vi.importActual<typeof import("./posthog-server")>("./posthog-server");
  real.trackEvent("login_succeeded", { role: "admin" });
  expect(capture).toHaveBeenCalledWith({ event: "login_succeeded", properties: { role: "admin" }, disableGeoip: true });
  vi.doUnmock("posthog-node");
});
