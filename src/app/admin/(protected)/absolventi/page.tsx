import { desc, eq } from "drizzle-orm";
import { GraduationCap } from "lucide-react";
import { db } from "@/db";
import { students } from "@/db/schema";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { GraduatesTable } from "./graduates-table";

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
        <GraduatesTable groups={groups} />
      )}
    </div>
  );
}
