import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { StudentForm } from "../student-form";
import { DeleteStudentButton } from "../delete-student-button";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Editează student",
  robots: { index: false, follow: false },
};

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
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Editează student"
        action={<DeleteStudentButton studentId={student.id} studentName={student.fullName} />}
      />
      <Card className="mt-4">
        <CardContent className="py-4">
          <StudentForm mode="edit" student={student} />
        </CardContent>
      </Card>
    </div>
  );
}
