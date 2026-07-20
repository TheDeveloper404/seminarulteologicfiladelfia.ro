"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { createSession, destroySession } from "./session";
import { getClientIp, isRateLimited } from "./rate-limit";

export type AdminLoginState = { error: string } | null;

export async function loginAdmin(
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
  if (isRateLimited(`admin-login:${ip}`)) {
    return { error: "Prea multe încercări. Încearcă din nou peste câteva minute." };
  }

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  // Mesaj identic indiferent dacă emailul nu există sau parola e greșită,
  // ca să nu confirmăm existența unui cont prin diferența de răspuns.
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return { error: "Email sau parolă incorectă." };
  }

  await createSession("admin", admin.id);
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await destroySession("admin");
  redirect("/admin/login");
}
