import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { graduationDocuments, students } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { readGeneratedDocument } from "@/lib/documents/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Doar admin — diplomele/certificatele generate nu sunt vizibile din portalul studentului.
  const adminSession = await getSession("admin");
  if (!adminSession) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const documentId = Number(id);
  if (!Number.isInteger(documentId)) {
    return NextResponse.json({ error: "Nu a fost găsit" }, { status: 404 });
  }

  const [row] = await db
    .select({
      filePath: graduationDocuments.filePath,
      type: graduationDocuments.type,
      issueNumber: graduationDocuments.issueNumber,
      fullName: students.fullName,
    })
    .from(graduationDocuments)
    .innerJoin(students, eq(graduationDocuments.studentId, students.id))
    .where(eq(graduationDocuments.id, documentId))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Nu a fost găsit" }, { status: 404 });
  }

  const fileBuffer = await readGeneratedDocument(row.filePath);
  const label = row.type === "diploma" ? "Diploma" : "Certificat";
  const fileName = `${label} - ${row.fullName}.pdf`;

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
    },
  });
}
