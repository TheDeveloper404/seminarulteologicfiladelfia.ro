import type { Metadata } from "next";
import { desc, eq, inArray } from "drizzle-orm";
import { GraduationCap } from "lucide-react";
import { db } from "@/db";
import { grades, graduationDocuments, students } from "@/db/schema";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { GraduatesTable } from "./graduates-table";

export const metadata: Metadata = {
  title: "Arhivă absolvenți",
  robots: { index: false, follow: false },
};

type Student = {
  id: number;
  publicId: string;
  fullName: string;
  enrollmentYear: number;
  graduatedAt: Date | null;
  isHistoricalImport: boolean;
  notes: string | null;
};

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
    .select({
      id: students.id,
      publicId: students.publicId,
      fullName: students.fullName,
      enrollmentYear: students.enrollmentYear,
      graduatedAt: students.graduatedAt,
      isHistoricalImport: students.isHistoricalImport,
      notes: students.notes,
    })
    .from(students)
    .where(eq(students.graduated, true))
    .orderBy(desc(students.graduatedAt));

  const groups = groupByGraduationYear(graduates);

  type GradeSummary = { id: number; subject: string; grade: string; gradedAt: string };
  const gradesByStudent = new Map<number, GradeSummary[]>();
  type DocumentSummary = {
    id: number;
    type: "diploma" | "certificat";
    issueNumber: string;
    issueDate: string;
  };
  const documentsByStudent = new Map<number, DocumentSummary[]>();
  if (graduates.length > 0) {
    const [graduateGrades, graduateDocuments] = await Promise.all([
      db
        .select({
          id: grades.id,
          studentId: grades.studentId,
          subject: grades.subject,
          grade: grades.grade,
          gradedAt: grades.gradedAt,
        })
        .from(grades)
        .where(
          inArray(
            grades.studentId,
            graduates.map((g) => g.id)
          )
        )
        .orderBy(desc(grades.gradedAt)),
      db
        .select({
          id: graduationDocuments.id,
          studentId: graduationDocuments.studentId,
          type: graduationDocuments.type,
          issueNumber: graduationDocuments.issueNumber,
          issueDate: graduationDocuments.issueDate,
        })
        .from(graduationDocuments)
        .where(
          inArray(
            graduationDocuments.studentId,
            graduates.map((g) => g.id)
          )
        )
        .orderBy(desc(graduationDocuments.generatedAt)),
    ]);

    for (const { studentId, ...grade } of graduateGrades) {
      const list = gradesByStudent.get(studentId) ?? [];
      list.push(grade);
      gradesByStudent.set(studentId, list);
    }
    for (const { studentId, ...doc } of graduateDocuments) {
      const list = documentsByStudent.get(studentId) ?? [];
      list.push(doc);
      documentsByStudent.set(studentId, list);
    }
  }

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
        <GraduatesTable
          groups={groups}
          gradesByStudent={Object.fromEntries(gradesByStudent)}
          documentsByStudent={Object.fromEntries(documentsByStudent)}
        />
      )}
    </div>
  );
}
