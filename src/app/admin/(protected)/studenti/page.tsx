import Link from "next/link";
import { desc } from "drizzle-orm";
import { Users } from "lucide-react";
import { db } from "@/db";
import { students } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { StudentsTable } from "./students-table";

export default async function StudentsPage() {
  const allStudents = await db
    .select()
    .from(students)
    .orderBy(desc(students.createdAt));

  const addStudentButton = (
    <Button render={<Link href="/admin/studenti/nou" />} nativeButton={false}>
      Adaugă student
    </Button>
  );

  return (
    <div>
      <PageHeader title="Studenți" action={addStudentButton} />

      {allStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Niciun student înregistrat încă"
          description="Adaugă primul student pentru a-i genera ID-ul unic de autentificare în portal."
          action={addStudentButton}
        />
      ) : (
        <StudentsTable students={allStudents} />
      )}
    </div>
  );
}
