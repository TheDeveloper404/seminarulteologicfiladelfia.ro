"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { graduationDocuments, sessions, students } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteGeneratedDocumentFile } from "@/lib/documents/storage";
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
  const birthDateInput = String(formData.get("birthDate") ?? "").trim();
  const birthLocality = String(formData.get("birthLocality") ?? "").trim();
  const birthCounty = String(formData.get("birthCounty") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const baptismDateInput = String(formData.get("baptismDate") ?? "").trim();
  const homeChurch = String(formData.get("homeChurch") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!fullName) {
    return { error: "Numele complet este obligatoriu." };
  }
  if (!Number.isInteger(enrollmentYear) || enrollmentYear < 2000) {
    return { error: "Anul de înscriere nu este valid." };
  }
  if (graduatedAtInput && Number.isNaN(Date.parse(graduatedAtInput))) {
    return { error: "Data absolvirii nu este validă." };
  }
  if (birthDateInput && Number.isNaN(Date.parse(birthDateInput))) {
    return { error: "Data nașterii nu este validă." };
  }
  if (baptismDateInput && Number.isNaN(Date.parse(baptismDateInput))) {
    return { error: "Data botezului nu este validă." };
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
      birthDate: birthDateInput || null,
      birthLocality: birthLocality || null,
      birthCounty: birthCounty || null,
      address: address || null,
      baptismDate: baptismDateInput || null,
      homeChurch: homeChurch || null,
      notes: notes || null,
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
  revalidatePath("/admin/absolventi");
  // Un absolvent nu mai apare în lista de studenți activi — dacă editarea l-a lăsat (sau l-a
  // făcut) absolvent, salvarea trebuie să te ducă înapoi la /admin/absolventi, nu la o listă
  // unde nu se mai regăsește.
  redirect(graduated ? "/admin/absolventi" : "/admin/studenti");
}

export async function deleteStudent(studentId: number): Promise<void> {
  await requireAdmin();

  // Cascada din schema (graduation_documents.student_id ON DELETE CASCADE) șterge rândurile din
  // DB, dar nu și fișierele PDF de pe disc — trebuie șterse explicit înainte, la fel ca în
  // deleteGraduationDocument.
  const documents = await db
    .select({ filePath: graduationDocuments.filePath })
    .from(graduationDocuments)
    .where(eq(graduationDocuments.studentId, studentId));

  await db.delete(students).where(eq(students.id, studentId));

  await Promise.all(documents.map((doc) => deleteGeneratedDocumentFile(doc.filePath)));

  revalidatePath("/admin/studenti");
  revalidatePath("/admin/absolventi");
  redirect("/admin/studenti");
}
