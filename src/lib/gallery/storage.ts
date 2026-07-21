import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

// Public — spre deosebire de materialele de curs, pozele de galerie sunt vizibile fără
// autentificare, deci stau în `public/` (servite direct de Next.js), nu în afara ei.
const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function isAllowedImageExtension(originalFileName: string): boolean {
  return ALLOWED_EXTENSIONS.has(path.extname(originalFileName).toLowerCase());
}

export async function saveGalleryPhoto(year: number, file: File): Promise<string> {
  const yearDir = path.join(GALLERY_DIR, String(year));
  await mkdir(yearDir, { recursive: true });

  const extension = path.extname(file.name).toLowerCase();
  const diskFileName = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(yearDir, diskFileName), buffer);

  return diskFileName;
}

export async function deleteGalleryPhoto(year: number, fileName: string): Promise<void> {
  await unlink(path.join(GALLERY_DIR, String(year), fileName)).catch(() => {});
}

export function galleryPhotoUrl(year: number, fileName: string): string {
  return `/gallery/${year}/${fileName}`;
}
