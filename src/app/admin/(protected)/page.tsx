import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import {
  Users,
  GraduationCap,
  FileText,
  Images,
  UserPlus,
  Upload,
  FolderPlus,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db";
import { students, courseMaterials, attendance, galleryAlbums } from "@/db/schema";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Panou de control",
  robots: { index: false, follow: false },
};

const RECENT_SESSIONS_COUNT = 6;

function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminDashboardPage() {
  const [
    allStudents,
    materials,
    albumCount,
    studyYearRows,
    recentSessionsDesc,
    recentStudents,
  ] = await Promise.all([
    db.select().from(students),
    db.select().from(courseMaterials),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(galleryAlbums),
    db
      .select({
        studyYear: students.studyYear,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(students)
      .where(eq(students.graduated, false))
      .groupBy(students.studyYear),
    db
      .select({
        sessionDate: attendance.sessionDate,
        total: sql<number>`count(*)`.mapWith(Number),
        present: sql<number>`count(*) filter (where ${attendance.present})`.mapWith(Number),
      })
      .from(attendance)
      .groupBy(attendance.sessionDate)
      .orderBy(desc(attendance.sessionDate))
      .limit(RECENT_SESSIONS_COUNT),
    db
      .select({
        id: students.id,
        fullName: students.fullName,
        enrollmentYear: students.enrollmentYear,
        createdAt: students.createdAt,
      })
      .from(students)
      .where(eq(students.graduated, false))
      .orderBy(desc(students.createdAt))
      .limit(5),
  ]);

  const activeStudents = allStudents.filter((s) => !s.graduated).length;
  const graduatedStudents = allStudents.filter((s) => s.graduated).length;
  const draftMaterials = materials.filter((m) => !m.published);

  const yearOneCount = studyYearRows.find((r) => r.studyYear === 1)?.count ?? 0;
  const yearTwoCount = studyYearRows.find((r) => r.studyYear === 2)?.count ?? 0;
  const maxYearCount = Math.max(yearOneCount, yearTwoCount, 1);

  const recentSessions = [...recentSessionsDesc].reverse();
  const maxSessionRate = recentSessions.length > 0 ? 100 : 1;

  const stats = [
    {
      label: "Studenți activi",
      value: activeStudents,
      icon: Users,
      href: "/admin/studenti",
      border: "border-l-chart-1",
      iconBg: "bg-chart-1/15",
      iconColor: "text-chart-1",
    },
    {
      label: "Absolvenți",
      value: graduatedStudents,
      icon: GraduationCap,
      href: "/admin/absolventi",
      border: "border-l-chart-2",
      iconBg: "bg-chart-2/15",
      iconColor: "text-chart-2",
    },
    {
      label: "Materiale de curs",
      value: materials.length,
      icon: FileText,
      href: "/admin/materiale",
      border: "border-l-chart-3",
      iconBg: "bg-chart-3/15",
      iconColor: "text-chart-3",
    },
    {
      label: "Albume galerie",
      value: albumCount[0]?.count ?? 0,
      icon: Images,
      href: "/admin/galerie",
      border: "border-l-chart-4",
      iconBg: "bg-chart-4/15",
      iconColor: "text-chart-4",
    },
  ] as const;

  const quickActions = [
    { label: "Adaugă student", href: "/admin/studenti/nou", icon: UserPlus },
    { label: "Importă din registru", href: "/admin/studenti/import", icon: Upload },
    { label: "Încarcă material", href: "/admin/materiale", icon: FileText },
    { label: "Creează album", href: "/admin/galerie", icon: FolderPlus },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panou de control"
        description="Prezența, materialele de curs și notele studenților, dintr-un singur loc."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className={`border-l-4 py-5 transition-shadow hover:shadow-md ${stat.border}`}>
              <CardContent className="flex items-center gap-4 py-0">
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}
                >
                  <stat.icon className={`size-7 ${stat.iconColor}`} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-4xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-base text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Studenți pe an de studiu</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-2">
            {[
              { label: "Anul I", count: yearOneCount, barColor: "bg-chart-1" },
              { label: "Anul II", count: yearTwoCount, barColor: "bg-chart-2" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-4">
                <span className="w-16 shrink-0 text-base font-medium text-muted-foreground">
                  {row.label}
                </span>
                <div className="h-8 flex-1 overflow-hidden rounded-md bg-muted">
                  <div
                    className={`h-full rounded-r-md transition-all ${row.barColor}`}
                    style={{ width: `${(row.count / maxYearCount) * 100}%` }}
                    title={`${row.label}: ${row.count}`}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-base font-semibold text-foreground">
                  {row.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" aria-hidden="true" />
              Prezență — ultimele sesiuni
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {recentSessions.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="Nicio sesiune de prezență încă"
                description="Marchează prezența studenților din pagina Studenți."
                className="mt-0"
              />
            ) : (
              <div className="flex h-32 items-end gap-3">
                {recentSessions.map((session) => {
                  const rate =
                    session.total === 0 ? 0 : Math.round((session.present / session.total) * 100);
                  return (
                    <div
                      key={session.sessionDate}
                      className="flex flex-1 flex-col items-center gap-1.5"
                      title={`${formatSessionDate(session.sessionDate)}: ${rate}% prezență (${session.present}/${session.total})`}
                    >
                      <span className="text-sm font-medium text-foreground">{rate}%</span>
                      <div className="flex h-20 w-full items-end overflow-hidden rounded-t-md bg-muted">
                        <div
                          className="w-full rounded-t-md bg-chart-1 transition-all"
                          style={{ height: `${Math.max((rate / maxSessionRate) * 100, 4)}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatSessionDate(session.sessionDate)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Acțiuni rapide</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start gap-2 text-base"
                render={<Link href={action.href} />}
                nativeButton={false}
              >
                <action.icon className="size-4" aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Studenți adăugați recent</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Niciun student activ"
                description="Studenții adăugați apar aici."
                className="mt-0"
              />
            ) : (
              <ul className="flex flex-col divide-y">
                {recentStudents.map((student) => (
                  <li key={student.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/admin/studenti/${student.id}`}
                      className="flex items-center justify-between gap-3 hover:text-primary"
                    >
                      <span>{student.fullName}</span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {student.enrollmentYear}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              Materiale nepublicate{" "}
              <span className="text-muted-foreground">({draftMaterials.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {draftMaterials.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Nimic în așteptare"
                description="Toate materialele încărcate sunt deja publicate."
                className="mt-0"
              />
            ) : (
              <ul className="flex flex-col divide-y">
                {draftMaterials.slice(0, 5).map((material) => (
                  <li key={material.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href="/admin/materiale"
                      className="flex items-center justify-between gap-3 hover:text-primary"
                    >
                      <span className="truncate">{material.title}</span>
                    </Link>
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
