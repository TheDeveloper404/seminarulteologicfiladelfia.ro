import { desc, eq } from "drizzle-orm";
import { CalendarCheck } from "lucide-react";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Badge } from "@/components/ui/badge";

export default async function StudentAttendancePage() {
  const session = await getSession("student");
  const records = session
    ? await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentId, session.studentId!))
        .orderBy(desc(attendance.sessionDate))
    : [];

  return (
    <div>
      <PageHeader title="Prezența mea" />

      {records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nicio sesiune înregistrată încă"
          description="Prezența marcată de admin la fiecare sesiune va apărea aici."
        />
      ) : (
        <div className="mx-auto mt-6 max-w-md overflow-x-auto rounded-lg border">
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
                  <td className="p-4">{record.sessionDate}</td>
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
      )}
    </div>
  );
}
