"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteCourseMaterialFile, isAllowedExtension, saveCourseMaterialFile } from "./storage";

export type MaterialFormState = { error: string } | null;
export type EditMaterialState = { error: string } | { ok: true } | null;

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB, aliniat la bodySizeLimit din next.config.ts

export async function uploadCourseMaterial(
  _prevState: MaterialFormState,
  formData: FormData
): Promise<MaterialFormState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const file = formData.get("file");

  if (!title) {
    return { error: "Titlul este obligatoriu." };
  }
  if (title.length > 255) {
    return { error: "Titlul este prea lung (maxim 255 de caractere)." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selectează un fișier." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "Fișierul este prea mare (limită 50MB)." };
  }
  if (!isAllowedExtension(file.name)) {
    return { error: "Tip de fișier nepermis. Acceptat: PDF, Word, PowerPoint, Excel, audio, video, ZIP." };
  }

  const diskFileName = await saveCourseMaterialFile(file);

  await db.insert(courseMaterials).values({
    title,
    description: description || null,
    filePath: diskFileName,
    originalFileName: file.name,
    // Intenționat nepublicat: adminul pregătește cursurile în avans și le face vizibile manual,
    // când ajunge la ora respectivă (cerință client 2026-07-28).
    published: false,
  });

  revalidatePath("/admin/materiale");
  return null;
}

export async function setMaterialPublished(
  materialId: number,
  published: boolean
): Promise<void> {
  await requireAdmin();

  // Argumentele unui Server Action vin de la client — validate ca în updateCourseMaterial.
  if (!Number.isInteger(materialId)) return;

  await db
    .update(courseMaterials)
    .set({ published })
    .where(eq(courseMaterials.id, materialId));

  revalidatePath("/admin/materiale");
  revalidatePath("/portal/materiale");
}

export async function updateCourseMaterial(
  _prevState: EditMaterialState,
  formData: FormData
): Promise<EditMaterialState> {
  await requireAdmin();

  const materialId = Number(formData.get("materialId"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!Number.isInteger(materialId)) {
    return { error: "Material inexistent." };
  }
  if (!title) {
    return { error: "Titlul este obligatoriu." };
  }
  if (title.length > 255) {
    return { error: "Titlul este prea lung (maxim 255 de caractere)." };
  }

  await db
    .update(courseMaterials)
    .set({ title, description: description || null })
    .where(eq(courseMaterials.id, materialId));

  revalidatePath("/admin/materiale");
  revalidatePath("/portal/materiale");
  return { ok: true };
}

export async function deleteCourseMaterial(materialId: number): Promise<void> {
  await requireAdmin();

  const [material] = await db
    .select({ filePath: courseMaterials.filePath })
    .from(courseMaterials)
    .where(eq(courseMaterials.id, materialId))
    .limit(1);

  if (!material) return;

  await db.delete(courseMaterials).where(eq(courseMaterials.id, materialId));
  await deleteCourseMaterialFile(material.filePath);

  revalidatePath("/admin/materiale");
  revalidatePath("/portal/materiale");
}
