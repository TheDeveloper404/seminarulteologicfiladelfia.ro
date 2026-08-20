import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { generateGraduationPdf, type GraduationDocumentType } from "@/lib/documents/generate";

// Previzualizare live, fără nicio scriere în DB/disc — spre deosebire de
// generateGraduationDocument (src/lib/documents/actions.ts), care salvează documentul. Adminul
// vede exact PDF-ul înainte să decidă dacă îl generează „pentru real".
export async function GET(request: Request) {
  const adminSession = await getSession("admin");
  if (!adminSession) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = Number(searchParams.get("studentId"));
  const type = searchParams.get("type");
  const issueNumber = (searchParams.get("issueNumber") ?? "").trim();
  const issueDateInput = (searchParams.get("issueDate") ?? "").trim();

  if (!Number.isInteger(studentId)) {
    return NextResponse.json({ error: "Student invalid." }, { status: 400 });
  }
  if (type !== "diploma" && type !== "certificat") {
    return NextResponse.json({ error: "Tip de document invalid." }, { status: 400 });
  }
  if (!issueDateInput || Number.isNaN(Date.parse(issueDateInput))) {
    return NextResponse.json({ error: "Data eliberării nu este validă." }, { status: 400 });
  }

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) {
    return NextResponse.json({ error: "Studentul nu a fost găsit." }, { status: 404 });
  }
  if (student.isHistoricalImport) {
    return NextResponse.json(
      { error: "Rândurile istorice importate nu pot primi diplomă/certificat generat." },
      { status: 400 }
    );
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generateGraduationPdf({
      student,
      type: type as GraduationDocumentType,
      // Placeholder vizibil dacă adminul nu a completat încă numărul — previzualizarea nu
      // trebuie să blocheze pe un câmp gol, doar generarea reală (vezi actions.ts) îl cere.
      issueNumber: issueNumber || "___",
      issueDate: new Date(issueDateInput),
    });
  } catch {
    return NextResponse.json({ error: "Previzualizarea a eșuat." }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      // "inline" — se deschide direct în tab, nu se descarcă (spre deosebire de
      // /api/documente/[id], care servește documentul deja generat, cu "attachment").
      "Content-Disposition": "inline",
      "Cache-Control": "no-store",
    },
  });
}
