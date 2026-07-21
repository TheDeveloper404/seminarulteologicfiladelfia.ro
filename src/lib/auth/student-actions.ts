"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { appSettings, students } from "@/db/schema";
import { createSession, destroySession } from "./session";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

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

  const ip = await getClientIp();
  if (isRateLimited(`student-login:${ip}`)) {
    return { error: "Prea multe încercări. Încearcă din nou peste câteva minute." };
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

  await createSession("student", student.id);
  redirect("/portal");
}

export async function logoutStudent(): Promise<void> {
  await destroySession("student");
  redirect("/portal/login");
}
