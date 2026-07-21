import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { Users } from "lucide-react";
import { db } from "@/db";
import { attendance, students } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { StudentsTable } from "./students-table";

const RECENT_ATTENDANCE_COUNT = 10;

function firstDayOfCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  const sessionDate = data || firstDayOfCurrentMonth();

  const allStudents = await db
    .select()
    .from(students)
    .where(eq(students.graduated, false))
    .orderBy(desc(students.createdAt));

  const sessionAttendance =
    allStudents.length === 0
      ? []
      : await db
          .select({ studentId: attendance.studentId, present: attendance.present })
          .from(attendance)
          .where(eq(attendance.sessionDate, sessionDate));

  const presentByStudentId: Record<number, boolean> = Object.fromEntries(
    sessionAttendance.map((record) => [record.studentId, record.present])
  );

  const attendanceRecords =
    allStudents.length === 0
      ? []
      : await db
          .select({
            studentId: attendance.studentId,
            sessionDate: attendance.sessionDate,
            present: attendance.present,
          })
          .from(attendance)
          .where(
            inArray(
              attendance.studentId,
              allStudents.map((s) => s.id)
            )
          )
          .orderBy(desc(attendance.sessionDate));

  const recentAttendanceByStudentId = new Map<
    number,
    { sessionDate: string; present: boolean }[]
  >();
  for (const record of attendanceRecords) {
    const existing = recentAttendanceByStudentId.get(record.studentId) ?? [];
    if (existing.length < RECENT_ATTENDANCE_COUNT) {
      existing.push({ sessionDate: record.sessionDate, present: record.present });
      recentAttendanceByStudentId.set(record.studentId, existing);
    }
  }

  const studentsWithAttendance = allStudents.map((student) => ({
    ...student,
    recentAttendance: (recentAttendanceByStudentId.get(student.id) ?? []).slice().reverse(),
  }));

  const addStudentButton = (
    <Button render={<Link href="/admin/studenti/nou" />} nativeButton={false}>
      Adaugă student
    </Button>
  );

  return (
    <div>
      <PageHeader title="Studenți" action={addStudentButton} />

      {allStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Niciun student înregistrat încă"
          description="Adaugă primul student pentru a-i genera ID-ul unic de autentificare în portal."
          action={addStudentButton}
        />
      ) : (
        <StudentsTable
          students={studentsWithAttendance}
          sessionDate={sessionDate}
          presentByStudentId={presentByStudentId}
        />
      )}
    </div>
  );
}
