"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { createSession, destroySession } from "./session";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { logAuthEvent } from "./audit-log";
import { notifySlack } from "@/lib/slack-alert";

export type AdminLoginState = { error: string } | null;

// Eroare neasteptata (ex. baza de date cazuta) → alerta pe Slack, apoi aceeasi eroare ca inainte.
// `unstable_rethrow` lasa sa treaca redirect-ul de dupa login (eroare interna Next, nu o problema).
export async function loginAdmin(
  prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  try {
    return await attemptAdminLogin(prevState, formData);
  } catch (err) {
    unstable_rethrow(err);
    await notifySlack("login-admin-error", `login admin: eroare de server (${err instanceof Error ? err.name : "UNKNOWN"})`);
    throw err;
  }
}

async function attemptAdminLogin(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completează email și parola." };
  }

  const ip = await getClientIp();
  if (await isRateLimited(`admin-login:${ip}`)) {
    logAuthEvent("rate_limited", "admin", ip);
    return { error: "Prea multe încercări. Încearcă din nou peste câteva minute." };
  }

  const turnstileToken = formData.get("cf-turnstile-response");
  const turnstileOk = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : null,
    ip
  );
  if (!turnstileOk) {
    logAuthEvent("turnstile_failed", "admin", ip);
    return { error: "Verificarea anti-bot a eșuat. Reîncarcă pagina și încearcă din nou." };
  }

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  // Mesaj identic indiferent dacă emailul nu există sau parola e greșită,
  // ca să nu confirmăm existența unui cont prin diferența de răspuns.
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    logAuthEvent("login_failed", "admin", ip);
    return { error: "Email sau parolă incorectă." };
  }

  await createSession("admin", admin.id);
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await destroySession("admin");
  redirect("/admin/login");
}
