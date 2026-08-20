import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

// Public — spre deosebire de materialele de curs, pozele de galerie sunt vizibile fără
// autentificare, deci stau în `public/` (servite direct de Next.js), nu în afara ei.
const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function isAllowedImageExtension(originalFileName: string): boolean {
  return ALLOWED_EXTENSIONS.has(path.extname(originalFileName).toLowerCase());
}

// Verificare pe magic bytes, nu doar pe extensie (audit 2026-08-19, SEC-005) — un fișier
// `poza.jpg` care conține de fapt HTML/JS ar fi servit direct de nginx din public/gallery/,
// în afara header-elor de securitate din next.config.ts (vezi location /gallery/ din vhost),
// deci fără nosniff acolo un atacator CU sesiune de admin ar putea servi conținut executabil
// same-origin. Verifică primii bytes din fișier, nu extensia declarată de client.
function matchesImageMagicBytes(buffer: Buffer, extension: string): boolean {
  if (extension === ".png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (extension === ".jpg" || extension === ".jpeg") {
    return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  }
  if (extension === ".webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

// Poze de telefon/aparat foto necomprimate ajung frecvent la 5-15MB și câteva mii de pixeli
// lățime — irelevant de mare pentru un grid de thumbnail-uri sau chiar pentru lightbox-ul de pe
// site. Redimensionăm + reencodăm la upload (performance-review 2026-08-20: un album de 16 poze
// netratate transfera 12MB pe o singură vizită a paginii publice /arhiva/[slug]).
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;

export async function processImage(buffer: Buffer, extension: string): Promise<Buffer> {
  // .rotate() fără argument = auto-orientare după EXIF, înainte ca resize să piardă metadata.
  const pipeline = sharp(buffer)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });

  if (extension === ".png") return pipeline.png({ compressionLevel: 9 }).toBuffer();
  if (extension === ".webp") return pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
  return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

export async function saveGalleryPhoto(year: number, file: File): Promise<string> {
  const extension = path.extname(file.name).toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!matchesImageMagicBytes(buffer, extension)) {
    throw new Error("Fișierul nu pare a fi o imagine validă de tipul declarat.");
  }

  const processedBuffer = await processImage(buffer, extension);

  const yearDir = path.join(GALLERY_DIR, String(year));
  await mkdir(yearDir, { recursive: true });

  const diskFileName = `${randomUUID()}${extension}`;
  await writeFile(path.join(yearDir, diskFileName), processedBuffer);

  return diskFileName;
}

export async function deleteGalleryPhoto(year: number, fileName: string): Promise<void> {
  await unlink(path.join(GALLERY_DIR, String(year), fileName)).catch(() => {});
}

export function galleryPhotoUrl(year: number, fileName: string): string {
  return `/gallery/${year}/${fileName}`;
}
