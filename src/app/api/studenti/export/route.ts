import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const adminSession = await getSession("admin");
  if (!adminSession) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({
        fullName: students.fullName,
        enrollmentYear: students.enrollmentYear,
        studyYear: students.studyYear,
      })
      .from(students)
      .where(eq(students.graduated, false))
      .orderBy(asc(students.fullName));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Studenți");
    sheet.columns = [
      { header: "Nr. crt.", key: "number", width: 12 },
      { header: "Nume", key: "fullName", width: 40 },
      { header: "Anul înscrierii", key: "enrollmentYear", width: 20 },
      { header: "Anul curent de studiu", key: "studyYear", width: 24 },
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.addRows(rows.map((student, index) => ({ number: index + 1, ...student })));

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="studenti.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Exportul a eșuat." }, { status: 500 });
  }
}
