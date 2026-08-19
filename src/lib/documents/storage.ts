import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

// Fișierele stau în afara `public/`, ca și materialele de curs — descărcarea trece exclusiv
// prin ruta protejată /api/documente/[id].
const GENERATED_DOCS_DIR =
  process.env.GENERATED_DOCS_DIR || path.join(process.cwd(), "uploads", "graduation-documents");

export async function saveGeneratedDocument(pdfBytes: Uint8Array): Promise<string> {
  await mkdir(GENERATED_DOCS_DIR, { recursive: true });

  const diskFileName = `${randomUUID()}.pdf`;
  await writeFile(path.join(GENERATED_DOCS_DIR, diskFileName), pdfBytes);

  return diskFileName;
}

export async function readGeneratedDocument(diskFileName: string): Promise<Buffer> {
  return readFile(path.join(GENERATED_DOCS_DIR, diskFileName));
}

export async function deleteGeneratedDocumentFile(diskFileName: string): Promise<void> {
  await unlink(path.join(GENERATED_DOCS_DIR, diskFileName)).catch(() => {});
}
