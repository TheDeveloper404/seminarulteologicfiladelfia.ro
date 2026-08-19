"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { appSettings, students } from "@/db/schema";
import { createSession, destroySession } from "./session";
import { clearRateLimit, getClientIp, isRateLimited } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { logAuthEvent } from "./audit-log";

export type StudentLoginState = { error: string } | null;

export async function loginStudent(
  _prevState: StudentLoginState,
  formData: FormData
): Promise<StudentLoginState> {
  const publicId = String(formData.get("publicId") ?? "")
    .trim()
    .toUpperCase();
  const password = String(formData.get("password") ?? "");

  if (!publicId || !password) {
    return { error: "Completează ID-ul și parola." };
  }

  // Limită mai strictă decât default-ul (10/15min): studenții se autentifică toți cu aceeași
  // parolă comună, deci un atacator care ghicește parola nu mai are nevoie decât de ID-uri
  // valide — 5 încercări/15min per IP reduce fereastra de brute-force fără să deranjeze
  // utilizarea normală (o greșeală de tastare, nu 6).
  const ip = await getClientIp();
  if (await isRateLimited(`student-login:${ip}`, 5)) {
    logAuthEvent("rate_limited", "student", ip);
    return { error: "Prea multe încercări. Încearcă din nou peste câteva minute." };
  }

  const turnstileToken = formData.get("cf-turnstile-response");
  const turnstileOk = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : null,
    ip
  );
  if (!turnstileOk) {
    logAuthEvent("turnstile_failed", "student", ip);
    return { error: "Verificarea anti-bot a eșuat. Reîncarcă pagina și încearcă din nou." };
  }

  const [settings] = await db.select().from(appSettings).limit(1);
  // Normalizată la fel ca la setare (scripts/set-shared-password.ts) — case-insensitive, ca
  // studenții să nu fie respinși din cauza Caps Lock/Shift pe mobil.
  const normalizedPassword = password.trim().toLowerCase();
  if (!settings || !(await bcrypt.compare(normalizedPassword, settings.sharedPasswordHash))) {
    logAuthEvent("login_failed", "student", ip);
    return { error: "ID sau parolă incorectă." };
  }

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.publicId, publicId))
    .limit(1);

  // Același mesaj ca la parolă greșită — nu confirmăm dacă un ID există sau nu.
  if (!student) {
    logAuthEvent("login_failed", "student", ip);
    return { error: "ID sau parolă incorectă." };
  }

  // Același mesaj ca ID inexistent/parolă greșită (audit 2026-08-19, SEC-004) — un mesaj
  // distinct pentru "absolvent" confirma cuiva care are parola comună (orice student curent)
  // că un ID anume există și aparține unui absolvent. Arhivarea se comunică în afara portalului.
  if (student.graduated) {
    logAuthEvent("login_failed", "student", ip);
    return { error: "ID sau parolă incorectă." };
  }

  // Autentificare reușită → contorul per IP se resetează, ca studenții care ies prin același IP
  // (wifi-ul seminarului) să nu se blocheze unii pe alții. Vezi comentariul din clearRateLimit.
  await clearRateLimit(`student-login:${ip}`);

  await createSession("student", student.id);
  redirect("/portal");
}

export async function logoutStudent(): Promise<void> {
  await destroySession("student");
  redirect("/portal/login");
}
