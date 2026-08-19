import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  NotebookText,
  CalendarCheck,
  FileText,
  IdCard,
  ArrowRight,
} from "lucide-react";
import { db } from "@/db";
import { attendance, courseMaterials, grades, students } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/app-shell/page-header";
import { StatCard } from "@/components/app-shell/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contul meu",
  robots: { index: false, follow: false },
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("ro-RO");
}

export default async function PortalDashboardPage() {
  const session = await getSession("student");
  const studentId = session?.studentId ?? null;

  // Un singur set de query-uri pentru tot dashboard-ul; fiecare e filtrat pe studentul curent,
  // fără join-uri în buclă (nu apare N+1 pe măsură ce cresc înregistrările).
  const [studentRows, gradeRows, attendanceRows, materialRows] = await Promise.all([
    studentId
      ? db.select().from(students).where(eq(students.id, studentId)).limit(1)
      : Promise.resolve([]),
    studentId
      ? db
          .select()
          .from(grades)
          .where(eq(grades.studentId, studentId))
          .orderBy(desc(grades.gradedAt))
      : Promise.resolve([]),
    studentId
      ? db
          .select()
          .from(attendance)
          .where(eq(attendance.studentId, studentId))
          .orderBy(desc(attendance.sessionDate))
      : Promise.resolve([]),
    db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.published, true))
      .orderBy(desc(courseMaterials.uploadedAt)),
  ]);

  const student = studentRows[0];

  const average =
    gradeRows.length > 0
      ? gradeRows.reduce((sum, row) => sum + Number(row.grade), 0) / gradeRows.length
      : null;
  const presentCount = attendanceRows.filter((row) => row.present).length;
  const attendanceRate =
    attendanceRows.length > 0
      ? Math.round((presentCount / attendanceRows.length) * 100)
      : null;

  const recentGrades = gradeRows.slice(0, 5);
  const recentMaterials = materialRows.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title={student ? `Bine ai venit, ${student.fullName}` : "Contul meu"}
        description="Situația ta școlară, pe scurt."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={NotebookText}
          label="Media notelor"
          value={average !== null ? average.toFixed(2) : "—"}
          hint={
            gradeRows.length > 0
              ? `${gradeRows.length} ${gradeRows.length === 1 ? "notă" : "note"}`
              : "Nicio notă încă"
          }
        />
        <StatCard
          icon={CalendarCheck}
          label="Prezență"
          value={attendanceRate !== null ? `${attendanceRate}%` : "—"}
          hint={
            attendanceRows.length > 0
              ? `${presentCount} din ${attendanceRows.length} sesiuni`
              : "Nicio sesiune încă"
          }
        />
        <StatCard
          icon={FileText}
          label="Materiale disponibile"
          value={String(materialRows.length)}
          hint={materialRows.length > 0 ? "Gata de descărcat" : "Niciunul publicat încă"}
        />
        <StatCard
          icon={IdCard}
          label="ID student"
          value={student?.publicId ?? "—"}
          hint={student ? `Anul ${student.studyYear} · înscris ${student.enrollmentYear}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Ultimele note</CardTitle>
            <Link
              href="/portal/note"
              className="flex shrink-0 items-center gap-1 text-base text-primary underline"
            >
              Toate notele
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentGrades.length === 0 ? (
              <p className="text-base text-muted-foreground">
                Notele acordate de profesori vor apărea aici.
              </p>
            ) : (
              <ul className="flex flex-col">
                {recentGrades.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(row.gradedAt)}
                      </p>
                    </div>
                    <span className="font-heading text-xl font-semibold">{row.grade}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Materiale recente</CardTitle>
            <Link
              href="/portal/materiale"
              className="flex shrink-0 items-center gap-1 text-base text-primary underline"
            >
              Toate materialele
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentMaterials.length === 0 ? (
              <p className="text-base text-muted-foreground">
                Materialele publicate de seminar vor apărea aici.
              </p>
            ) : (
              <ul className="flex flex-col">
                {recentMaterials.map((material) => (
                  <li
                    key={material.id}
                    className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <a
                        href={`/api/materiale/${material.id}`}
                        className="truncate font-medium text-primary underline"
                      >
                        {material.title}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(material.uploadedAt)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      Descarcă
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
