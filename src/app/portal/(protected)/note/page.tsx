import { desc, eq } from "drizzle-orm";
import { NotebookText } from "lucide-react";
import { db } from "@/db";
import { grades } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";

export default async function StudentGradesPage() {
  const session = await getSession("student");
  const records = session
    ? await db
        .select()
        .from(grades)
        .where(eq(grades.studentId, session.studentId!))
        .orderBy(desc(grades.gradedAt))
    : [];

  return (
    <div>
      <PageHeader title="Notele mele" />

      {records.length === 0 ? (
        <EmptyState
          icon={NotebookText}
          title="Nicio notă înregistrată"
          description="Notele acordate de admin vor apărea aici."
        />
      ) : (
        <div className="mt-6 max-w-2xl overflow-x-auto rounded-lg border">
          <table className="w-full text-base">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="w-full p-4 font-medium">Disciplină</th>
                <th className="p-4 font-medium whitespace-nowrap">Notă</th>
                <th className="p-4 font-medium whitespace-nowrap">Data</th>
              </tr>
            </thead>
            <tbody>
              {records.map((g) => (
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
