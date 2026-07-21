import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { GraduationCap } from "lucide-react";
import { db } from "@/db";
import { students } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";

type Student = typeof students.$inferSelect;

function groupByGraduationYear(graduates: Student[]): [string, Student[]][] {
  const groups = new Map<string, Student[]>();

  for (const student of graduates) {
    const key = student.graduatedAt
      ? String(new Date(student.graduatedAt).getFullYear())
      : "Fără dată";
    const group = groups.get(key) ?? [];
    group.push(student);
    groups.set(key, group);
  }

  return [...groups.entries()].sort(([a], [b]) => {
    if (a === "Fără dată") return 1;
    if (b === "Fără dată") return -1;
    return Number(b) - Number(a);
  });
}

export default async function GraduatesPage() {
  const graduates = await db
    .select()
    .from(students)
    .where(eq(students.graduated, true))
    .orderBy(desc(students.graduatedAt));

  const groups = groupByGraduationYear(graduates);

  return (
    <div>
      <PageHeader
        title="Arhivă absolvenți"
        description="Un student ajunge aici când e marcat „Absolvent” din pagina lui de editare."
      />

      {graduates.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Niciun absolvent încă"
          description="Studenții marcați „Absolvent” din pagina lor de editare apar aici."
        />
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {groups.map(([year, yearGraduates]) => (
            <div key={year}>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {year} <span className="text-muted-foreground">({yearGraduates.length})</span>
              </h2>
              <div className="mt-3 overflow-x-auto rounded-lg border">
                <table className="w-full text-base">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="p-4 font-medium whitespace-nowrap">ID</th>
                      <th className="w-full p-4 font-medium">Nume</th>
                      <th className="p-4 font-medium whitespace-nowrap">An înscriere</th>
                      <th className="p-4 font-medium whitespace-nowrap">Absolvit la</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {yearGraduates.map((student) => (
                      <tr key={student.id} className="border-t">
                        <td className="p-4 font-mono whitespace-nowrap">{student.publicId}</td>
                        <td className="p-4">{student.fullName}</td>
                        <td className="p-4 whitespace-nowrap">{student.enrollmentYear}</td>
                        <td className="p-4 whitespace-nowrap">
                          {student.graduatedAt
                            ? new Date(student.graduatedAt).toLocaleDateString("ro-RO")
                            : "—"}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            render={<Link href={`/admin/studenti/${student.id}`} />}
                            nativeButton={false}
                          >
                            Detalii
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
