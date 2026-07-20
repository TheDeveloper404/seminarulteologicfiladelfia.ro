import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

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
      <h1 className="font-heading text-xl font-semibold">Prezența mea</h1>

      {records.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nicio sesiune înregistrată încă.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Sesiune</th>
                <th className="p-3 font-medium">Prezent</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="p-3">{record.sessionDate}</td>
                  <td className="p-3">{record.present ? "Da" : "Nu"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
