import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { grades, students } from "@/db/schema";
import { GradeForm } from "./grade-form";

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
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-semibold">Note — {student.fullName}</h1>

      <div className="mt-6">
        <GradeForm studentId={studentId} />
      </div>

      {studentGrades.length === 0 ? (
        <p className="mt-6 text-base text-muted-foreground">Nicio notă înregistrată.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-base">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-4 font-medium">Disciplină</th>
                <th className="p-4 font-medium">Notă</th>
                <th className="p-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="p-4">{g.subject}</td>
                  <td className="p-4">{g.grade}</td>
                  <td className="p-4">{g.gradedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
