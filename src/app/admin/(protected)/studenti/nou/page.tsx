import type { Metadata } from "next";
import { StudentForm } from "../student-form";

export const metadata: Metadata = {
  title: "Adaugă student",
  robots: { index: false, follow: false },
};

export default function NewStudentPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-xl font-semibold">Adaugă student</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ID-ul de acces se generează automat, aleator — nu-l alegi tu.
      </p>
      <div className="mt-6">
        <StudentForm mode="create" />
      </div>
    </div>
  );
}
