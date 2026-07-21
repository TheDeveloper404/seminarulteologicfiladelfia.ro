"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { appSettings, students } from "@/db/schema";
import { createSession, destroySession } from "./session";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

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
    return { error: "Prea multe încercări. Încearcă din nou peste câteva minute." };
  }

  const turnstileToken = formData.get("cf-turnstile-response");
  const turnstileOk = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : null,
    ip
  );
  if (!turnstileOk) {
    return { error: "Verificarea anti-bot a eșuat. Reîncarcă pagina și încearcă din nou." };
  }

  const [settings] = await db.select().from(appSettings).limit(1);
  if (!settings || !(await bcrypt.compare(password, settings.sharedPasswordHash))) {
    return { error: "ID sau parolă incorectă." };
  }

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.publicId, publicId))
    .limit(1);

  // Același mesaj ca la parolă greșită — nu confirmăm dacă un ID există sau nu.
  if (!student) {
    return { error: "ID sau parolă incorectă." };
  }

  if (student.graduated) {
    return {
      error: "Acest cont a fost arhivat (absolvent) și nu mai are acces la portal.",
    };
  }

  await createSession("student", student.id);
  redirect("/portal");
}

export async function logoutStudent(): Promise<void> {
  await destroySession("student");
  redirect("/portal/login");
}
