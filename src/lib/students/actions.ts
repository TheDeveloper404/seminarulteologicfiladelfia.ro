"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { generateUniquePublicId } from "./generate-public-id";

export type StudentFormState = { error: string } | null;

export async function createStudent(
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  await requireAdmin();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const enrollmentYear = Number(formData.get("enrollmentYear"));

  if (!fullName) {
    return { error: "Numele complet este obligatoriu." };
  }
  if (!Number.isInteger(enrollmentYear) || enrollmentYear < 2000) {
    return { error: "Anul de înscriere nu este valid." };
  }

  const publicId = await generateUniquePublicId();

  await db.insert(students).values({
    publicId,
    fullName,
    phone: phone || null,
    email: email || null,
    enrollmentYear,
  });

  revalidatePath("/admin/studenti");
  redirect("/admin/studenti");
}

export async function updateStudent(
  studentId: number,
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  await requireAdmin();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const enrollmentYear = Number(formData.get("enrollmentYear"));
  const graduated = formData.get("graduated") === "on";

  if (!fullName) {
    return { error: "Numele complet este obligatoriu." };
  }
  if (!Number.isInteger(enrollmentYear) || enrollmentYear < 2000) {
    return { error: "Anul de înscriere nu este valid." };
  }

  await db
    .update(students)
    .set({
      fullName,
      phone: phone || null,
      email: email || null,
      enrollmentYear,
      graduated,
      graduatedAt: graduated ? new Date() : null,
    })
    .where(eq(students.id, studentId));

  revalidatePath("/admin/studenti");
  redirect("/admin/studenti");
}

export async function deleteStudent(studentId: number): Promise<void> {
  await requireAdmin();

  await db.delete(students).where(eq(students.id, studentId));

  revalidatePath("/admin/studenti");
  revalidatePath("/admin/absolventi");
  redirect("/admin/studenti");
}
