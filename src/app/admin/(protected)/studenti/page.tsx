import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { Upload, Users } from "lucide-react";
import { db } from "@/db";
import { attendance, students } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { isValidSessionDate, todaySessionDate } from "@/lib/attendance/session-date";
import { cn } from "@/lib/utils";
import { AttendanceSheet } from "./attendance-sheet";
import { StudentsTable } from "./students-table";

export const metadata: Metadata = {
  title: "Studenți",
  robots: { index: false, follow: false },
};

const RECENT_ATTENDANCE_COUNT = 10;

function SectionTabs({ active }: { active: "lista" | "prezenta" }) {
  const tabs = [
    { key: "lista", label: "Studenți", href: "/admin/studenti" },
    { key: "prezenta", label: "Prezență", href: "/admin/studenti?vedere=prezenta" },
  ] as const;

  return (
    <nav aria-label="Secțiuni studenți" className="mt-6 flex gap-1 border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-base font-medium transition-colors",
            tab.key === active
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; vedere?: string }>;
}) {
  const { data, vedere } = await searchParams;
  const view = vedere === "prezenta" ? "prezenta" : "lista";
  // Validat cu aceeași regulă ca la scriere (src/lib/attendance/actions.ts) — audit 2026-08-19,
  // SEC-008: fără asta, `?data=abc` trecea direct în interogarea Postgres și pica cu eroare de
  // cast (500) în loc de fallback la data implicită (azi, în fusul orar al seminarului).
  const sessionDate = data && isValidSessionDate(data) ? data : todaySessionDate();

  const allStudents = await db
    .select()
    .from(students)
    .where(eq(students.graduated, false))
    .orderBy(desc(students.createdAt));

  const needsAttendance = view === "prezenta" && allStudents.length > 0;

  const sessionAttendance =
    !needsAttendance
      ? []
      : await db
          .select({ studentId: attendance.studentId, present: attendance.present })
          .from(attendance)
          .where(eq(attendance.sessionDate, sessionDate));

  const presentByStudentId: Record<number, boolean> = Object.fromEntries(
    sessionAttendance.map((record) => [record.studentId, record.present])
  );

  const attendanceRecords =
    !needsAttendance
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

  const headerActions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        render={<Link href="/admin/studenti/import" />}
        nativeButton={false}
      >
        <Upload className="size-4" aria-hidden="true" />
        Importă din registru
      </Button>
      {addStudentButton}
    </div>
  );

  return (
    <div>
      <PageHeader title="Studenți" action={headerActions} />

      {allStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Niciun student înregistrat încă"
          description="Adaugă primul student pentru a-i genera ID-ul unic de autentificare în portal."
          action={addStudentButton}
        />
      ) : (
        <>
          <SectionTabs active={view} />
          {view === "prezenta" ? (
            <AttendanceSheet
              students={studentsWithAttendance}
              sessionDate={sessionDate}
              presentByStudentId={presentByStudentId}
            />
          ) : (
            <StudentsTable students={allStudents} />
          )}
        </>
      )}
    </div>
  );
}
