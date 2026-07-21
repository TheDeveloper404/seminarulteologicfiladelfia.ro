import type { Metadata } from "next";
import { StudentForm } from "../student-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Adaugă student",
  robots: { index: false, follow: false },
};

export default function NewStudentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Adaugă student"
        description="ID-ul de acces se generează automat, aleator — nu-l alegi tu."
      />
      <Card className="mt-6">
        <CardContent>
          <StudentForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
