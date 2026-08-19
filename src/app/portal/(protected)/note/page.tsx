import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { CalendarDays, ListChecks, NotebookText } from "lucide-react";
import { db } from "@/db";
import { grades } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { StatCard } from "@/components/app-shell/stat-card";

export const metadata: Metadata = {
  title: "Notele mele",
  robots: { index: false, follow: false },
};

export default async function StudentGradesPage() {
  const session = await getSession("student");
  const records = session
    ? await db
        .select()
        .from(grades)
        .where(eq(grades.studentId, session.studentId!))
        .orderBy(desc(grades.gradedAt))
    : [];

  const average =
    records.length > 0
      ? records.reduce((sum, row) => sum + Number(row.grade), 0) / records.length
      : null;

  return (
    <div className="space-y-8">
      <PageHeader title="Notele mele" description="Toate notele înregistrate, cele mai noi primele." />

      {records.length === 0 ? (
        <EmptyState
          icon={NotebookText}
          title="Nicio notă înregistrată"
          description="Notele acordate de profesori vor apărea aici."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={NotebookText}
              label="Media"
              value={average !== null ? average.toFixed(2) : "—"}
            />
            <StatCard
              icon={ListChecks}
              label="Note înregistrate"
              value={String(records.length)}
            />
            <StatCard
              icon={CalendarDays}
              label="Cea mai recentă"
              value={new Date(records[0].gradedAt).toLocaleDateString("ro-RO")}
              hint={records[0].subject}
            />
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-base">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="w-full p-4 font-medium">Disciplină</th>
                  <th className="p-4 font-medium whitespace-nowrap">Notă</th>
                  <th className="p-4 font-medium whitespace-nowrap">Data</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="p-4">{record.subject}</td>
                    <td className="p-4 font-medium whitespace-nowrap">{record.grade}</td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground">
                      {new Date(record.gradedAt).toLocaleDateString("ro-RO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
