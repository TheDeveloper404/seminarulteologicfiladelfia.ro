import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { CalendarCheck, CalendarDays, Percent } from "lucide-react";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { StatCard } from "@/components/app-shell/stat-card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Prezența mea",
  robots: { index: false, follow: false },
};

export default async function StudentAttendancePage() {
  const session = await getSession("student");
  const records = session
    ? await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentId, session.studentId!))
        .orderBy(desc(attendance.sessionDate))
    : [];

  const presentCount = records.filter((record) => record.present).length;
  const rate =
    records.length > 0 ? Math.round((presentCount / records.length) * 100) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Prezența mea"
        description="Toate sesiunile înregistrate, cele mai noi primele."
      />

      {records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nicio sesiune înregistrată încă"
          description="Prezența marcată la fiecare sesiune va apărea aici."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Percent}
              label="Rata de prezență"
              value={rate !== null ? `${rate}%` : "—"}
            />
            <StatCard
              icon={CalendarCheck}
              label="Sesiuni prezent"
              value={`${presentCount} din ${records.length}`}
            />
            <StatCard
              icon={CalendarDays}
              label="Ultima sesiune"
              value={new Date(records[0].sessionDate).toLocaleDateString("ro-RO")}
              hint={records[0].present ? "Prezent" : "Absent"}
            />
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-base">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="w-full p-4 font-medium">Sesiune</th>
                  <th className="p-4 font-medium whitespace-nowrap">Prezent</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="p-4">
                      {new Date(record.sessionDate).toLocaleDateString("ro-RO")}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant={record.present ? "default" : "secondary"}>
                        {record.present ? "Prezent" : "Absent"}
                      </Badge>
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
