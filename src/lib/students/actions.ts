"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, students } from "@/db/schema";
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
  const studyYear = formData.get("studyYear") === "2" ? 2 : 1;

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
    studyYear,
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
  const studyYear = formData.get("studyYear") === "2" ? 2 : 1;
  const graduated = formData.get("graduated") === "on";
  const graduatedAtInput = String(formData.get("graduatedAt") ?? "").trim();

  if (!fullName) {
    return { error: "Numele complet este obligatoriu." };
  }
  if (!Number.isInteger(enrollmentYear) || enrollmentYear < 2000) {
    return { error: "Anul de înscriere nu este valid." };
  }
  if (graduatedAtInput && Number.isNaN(Date.parse(graduatedAtInput))) {
    return { error: "Data absolvirii nu este validă." };
  }

  // Dacă adminul a completat manual data absolvirii, o folosim pe aceea (poate fi în trecut,
  // pentru studenți absolviți deja înainte de portal); altfel, la prima bifare, folosim azi.
  const graduatedAt = graduated
    ? graduatedAtInput
      ? new Date(graduatedAtInput)
      : new Date()
    : null;

  await db
    .update(students)
    .set({
      fullName,
      phone: phone || null,
      email: email || null,
      enrollmentYear,
      studyYear,
      graduated,
      graduatedAt,
    })
    .where(eq(students.id, studentId));

  if (graduated) {
    // Taie orice sesiune de portal deja activă a studentului — nu mai are acces din momentul
    // absolvirii, chiar dacă era logat cu câteva minute înainte.
    await db
      .delete(sessions)
      .where(and(eq(sessions.role, "student"), eq(sessions.studentId, studentId)));
  }

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
