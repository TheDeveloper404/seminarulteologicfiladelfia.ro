import type { Metadata } from "next";
import { StudentForm } from "../student-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getNextMatricolNumber } from "@/lib/students/matricol";

export const metadata: Metadata = {
  title: "Adaugă student",
  robots: { index: false, follow: false },
};

export default async function NewStudentPage() {
  const nextMatricol = await getNextMatricolNumber();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Adaugă student"
        description="ID-ul de acces și numărul matricol se generează automat — nu le alegi tu."
      />
      <Card className="mt-6">
        <CardContent className="py-2">
          <StudentForm mode="create" nextMatricol={nextMatricol} />
        </CardContent>
      </Card>
    </div>
  );
}
