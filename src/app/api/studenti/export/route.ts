import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { todaySessionDate } from "@/lib/attendance/session-date";

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
      { key: "number", width: 12 },
      { key: "fullName", width: 40 },
      { key: "enrollmentYear", width: 20 },
      { key: "studyYear", width: 24 },
    ];
    // Titlu + data exportului (fusul orar al seminarului) deasupra tabelului.
    const [year, month, day] = todaySessionDate().split("-");
    sheet.addRow(["Tabel prezență"]).font = { bold: true, size: 14 };
    sheet.addRow([`Data: ${day}.${month}.${year}`]);
    sheet.addRow([]);
    sheet.addRow(["Nr. crt.", "Nume", "Anul înscrierii", "Anul curent de studiu"]).font = { bold: true };
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
