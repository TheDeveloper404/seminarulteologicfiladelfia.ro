import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { grades, students } from "@/db/schema";
import { GradeForm } from "./grade-form";
import { GradeRow } from "./grade-row";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Memoizat per-request (React.cache) — generateMetadata și componenta paginii altfel ar rula
// aceeași interogare de două ori la fiecare randare.
const getStudent = cache(async (studentId: number) => {
  if (!Number.isInteger(studentId)) return undefined;
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  return student;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudent(Number(id));

  return {
    title: student ? `Note — ${student.fullName}` : "Note",
    robots: { index: false, follow: false },
  };
}

export default async function StudentGradesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);
  const student = await getStudent(studentId);
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
                <th className="p-4 font-medium whitespace-nowrap">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map((g) => (
                <GradeRow key={g.id} studentId={studentId} grade={g} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
