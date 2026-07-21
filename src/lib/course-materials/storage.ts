import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";

// Fișierele stau în afara `public/`, ca să nu fie servite direct fără verificarea sesiunii —
// descărcarea trece exclusiv prin ruta protejată /api/materiale/[id].
const UPLOADS_DIR =
  process.env.COURSE_MATERIALS_DIR || path.join(process.cwd(), "uploads", "course-materials");

// Extensii permise pentru materiale de curs — exclus explicit orice executabil/script.
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".mp3",
  ".mp4",
  ".zip",
]);

export function isAllowedExtension(originalFileName: string): boolean {
  return ALLOWED_EXTENSIONS.has(path.extname(originalFileName).toLowerCase());
}

export async function saveCourseMaterialFile(file: File): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true });

  const extension = path.extname(file.name).toLowerCase();
  const diskFileName = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(UPLOADS_DIR, diskFileName), buffer);

  return diskFileName;
}

export async function readCourseMaterialFile(diskFileName: string): Promise<Buffer> {
  return readFile(path.join(UPLOADS_DIR, diskFileName));
}

export async function deleteCourseMaterialFile(diskFileName: string): Promise<void> {
  await unlink(path.join(UPLOADS_DIR, diskFileName)).catch(() => {});
}
