import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { StudentForm } from "../student-form";
import { DeleteStudentButton } from "../delete-student-button";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const studentId = Number(id);

  if (!Number.isInteger(studentId)) {
    notFound();
  }

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Editează student</h1>
        <DeleteStudentButton studentId={student.id} studentName={student.fullName} />
      </div>
      <div className="mt-6">
        <StudentForm mode="edit" student={student} />
      </div>
    </div>
  );
}
