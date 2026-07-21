"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { galleryAlbums, galleryPhotos } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteGalleryPhoto, isAllowedImageExtension, saveGalleryPhoto } from "./storage";

export type AlbumFormState = { error: string } | null;
export type PhotoUploadState = { error: string } | null;

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB — poze de telefon/aparat foto

function slugify(title: string, year: number): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // elimină diacritice
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${year}-${base}` : String(year);
}

export async function createAlbum(
  _prevState: AlbumFormState,
  formData: FormData
): Promise<AlbumFormState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const year = Number(formData.get("year"));

  if (!title) {
    return { error: "Titlul este obligatoriu." };
  }
  if (!Number.isInteger(year) || year < 1990 || year > 2100) {
    return { error: "Anul nu este valid." };
  }

  const baseSlug = slugify(title, year);
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const [existing] = await db
      .select({ id: galleryAlbums.id })
      .from(galleryAlbums)
      .where(eq(galleryAlbums.slug, slug))
      .limit(1);
    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  await db.insert(galleryAlbums).values({ title, year, slug });

  revalidatePath("/admin/galerie");
  revalidatePath("/arhiva");
  redirect("/admin/galerie");
}

export async function deleteAlbum(albumId: number): Promise<void> {
  await requireAdmin();

  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.albumId, albumId));
  const [album] = await db
    .select()
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, albumId))
    .limit(1);

  if (album) {
    await Promise.all(photos.map((p) => deleteGalleryPhoto(album.year, p.fileName)));
  }

  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, albumId));

  revalidatePath("/admin/galerie");
  revalidatePath("/arhiva");
  redirect("/admin/galerie");
}

export async function uploadGalleryPhoto(
  albumId: number,
  _prevState: PhotoUploadState,
  formData: FormData
): Promise<PhotoUploadState> {
  await requireAdmin();

  const [album] = await db
    .select()
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, albumId))
    .limit(1);
  if (!album) {
    return { error: "Albumul nu a fost găsit." };
  }

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { error: "Selectează cel puțin o poză." };
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { error: `„${file.name}" e prea mare (limită 20MB).` };
    }
    if (!isAllowedImageExtension(file.name)) {
      return { error: `„${file.name}" nu e un format de imagine acceptat (jpg, png, webp).` };
    }
  }

  for (const file of files) {
    const fileName = await saveGalleryPhoto(album.year, file);
    await db.insert(galleryPhotos).values({ albumId, fileName });
  }

  revalidatePath(`/admin/galerie/${albumId}`);
  revalidatePath(`/arhiva/${album.slug}`);
  return null;
}

export async function deletePhoto(photoId: number): Promise<void> {
  await requireAdmin();

  const [photo] = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.id, photoId))
    .limit(1);
  if (!photo) return;

  const [album] = await db
    .select()
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, photo.albumId))
    .limit(1);

  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, photoId));

  if (album) {
    await deleteGalleryPhoto(album.year, photo.fileName);
    revalidatePath(`/admin/galerie/${album.id}`);
    revalidatePath(`/arhiva/${album.slug}`);
  }
}
