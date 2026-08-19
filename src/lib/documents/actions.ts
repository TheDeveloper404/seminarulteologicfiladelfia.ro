"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { graduationDocuments, students } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { generateGraduationPdf, type GraduationDocumentType } from "./generate";
import { deleteGeneratedDocumentFile, saveGeneratedDocument } from "./storage";

export type GenerateDocumentState = { error: string } | { ok: true } | null;

export async function generateGraduationDocument(
  studentId: number,
  _prevState: GenerateDocumentState,
  formData: FormData
): Promise<GenerateDocumentState> {
  await requireAdmin();

  const type = formData.get("type");
  const issueNumber = String(formData.get("issueNumber") ?? "").trim();
  const issueDateInput = String(formData.get("issueDate") ?? "").trim();

  if (type !== "diploma" && type !== "certificat") {
    return { error: "Tip de document invalid." };
  }
  if (!issueNumber) {
    return { error: "Numărul de înregistrare este obligatoriu." };
  }
  if (!issueDateInput || Number.isNaN(Date.parse(issueDateInput))) {
    return { error: "Data eliberării nu este validă." };
  }

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) {
    return { error: "Studentul nu a fost găsit." };
  }
  if (student.isHistoricalImport) {
    return { error: "Rândurile istorice importate nu pot primi diplomă/certificat generat." };
  }

  const issueDate = new Date(issueDateInput);
  const pdfBytes = await generateGraduationPdf({
    student,
    type: type as GraduationDocumentType,
    issueNumber,
    issueDate,
  });

  const filePath = await saveGeneratedDocument(pdfBytes);

  await db.insert(graduationDocuments).values({
    studentId,
    type: type as GraduationDocumentType,
    issueNumber,
    issueDate: issueDateInput,
    filePath,
  });

  revalidatePath("/admin/absolventi");
  return { ok: true };
}

export async function deleteGraduationDocument(documentId: number): Promise<void> {
  await requireAdmin();

  const [document] = await db
    .select({ filePath: graduationDocuments.filePath })
    .from(graduationDocuments)
    .where(eq(graduationDocuments.id, documentId))
    .limit(1);

  if (!document) return;

  await db.delete(graduationDocuments).where(eq(graduationDocuments.id, documentId));
  await deleteGeneratedDocumentFile(document.filePath);

  revalidatePath("/admin/absolventi");
}
