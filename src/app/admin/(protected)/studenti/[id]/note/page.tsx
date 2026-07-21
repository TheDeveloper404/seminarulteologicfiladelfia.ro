import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { grades, students } from "@/db/schema";
import { GradeForm } from "./grade-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function StudentGradesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) notFound();

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!student) notFound();

  const studentGrades = await db
    .select()
    .from(grades)
    .where(eq(grades.studentId, studentId))
    .orderBy(desc(grades.gradedAt));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={`Note — ${student.fullName}`} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Adaugă notă</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeForm studentId={studentId} />
        </CardContent>
      </Card>

      {studentGrades.length === 0 ? (
        <p className="mt-6 text-base text-muted-foreground">Nicio notă înregistrată.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-base">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="w-full p-4 font-medium">Disciplină</th>
                <th className="p-4 font-medium whitespace-nowrap">Notă</th>
                <th className="p-4 font-medium whitespace-nowrap">Data</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="p-4">{g.subject}</td>
                  <td className="p-4 whitespace-nowrap">{g.grade}</td>
                  <td className="p-4 whitespace-nowrap">{g.gradedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
