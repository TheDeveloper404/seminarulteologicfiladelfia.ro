"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { grades } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

export type GradeFormState = { error: string } | null;

export async function addGrade(
  studentId: number,
  _prevState: GradeFormState,
  formData: FormData
): Promise<GradeFormState> {
  await requireAdmin();

  const subject = String(formData.get("subject") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const gradedAt = String(formData.get("gradedAt") ?? "").trim();

  const gradeNumber = Number(grade);
  if (!subject) {
    return { error: "Disciplina este obligatorie." };
  }
  if (!grade || Number.isNaN(gradeNumber) || gradeNumber < 1 || gradeNumber > 10) {
    return { error: "Nota trebuie să fie între 1 și 10." };
  }
  if (!gradedAt) {
    return { error: "Data este obligatorie." };
  }

  await db.insert(grades).values({ studentId, subject, grade, gradedAt });

  revalidatePath(`/admin/studenti/${studentId}/note`);
  return null;
}

export async function updateGrade(
  gradeId: number,
  studentId: number,
  _prevState: GradeFormState,
  formData: FormData
): Promise<GradeFormState> {
  await requireAdmin();

  const subject = String(formData.get("subject") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const gradedAt = String(formData.get("gradedAt") ?? "").trim();

  const gradeNumber = Number(grade);
  if (!subject) {
    return { error: "Disciplina este obligatorie." };
  }
  if (!grade || Number.isNaN(gradeNumber) || gradeNumber < 1 || gradeNumber > 10) {
    return { error: "Nota trebuie să fie între 1 și 10." };
  }
  if (!gradedAt) {
    return { error: "Data este obligatorie." };
  }

  await db
    .update(grades)
    .set({ subject, grade, gradedAt })
    .where(and(eq(grades.id, gradeId), eq(grades.studentId, studentId)));

  revalidatePath(`/admin/studenti/${studentId}/note`);
  return null;
}

export async function deleteGrade(gradeId: number, studentId: number): Promise<void> {
  await requireAdmin();

  await db
    .delete(grades)
    .where(and(eq(grades.id, gradeId), eq(grades.studentId, studentId)));

  revalidatePath(`/admin/studenti/${studentId}/note`);
}
