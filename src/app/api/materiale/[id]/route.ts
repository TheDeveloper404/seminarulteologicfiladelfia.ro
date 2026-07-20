import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { readCourseMaterialFile } from "@/lib/course-materials/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Accesibil oricui e autentificat, admin sau student — nu conținut public.
  const [adminSession, studentSession] = await Promise.all([
    getSession("admin"),
    getSession("student"),
  ]);
  if (!adminSession && !studentSession) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isInteger(materialId)) {
    return NextResponse.json({ error: "Nu a fost găsit" }, { status: 404 });
  }

  const [material] = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.id, materialId))
    .limit(1);

  if (!material) {
    return NextResponse.json({ error: "Nu a fost găsit" }, { status: 404 });
  }

  const fileBuffer = await readCourseMaterialFile(material.filePath);

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(material.originalFileName)}"`,
    },
  });
}
