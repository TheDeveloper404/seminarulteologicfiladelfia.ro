import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { grades } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

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
      <h1 className="font-heading text-xl font-semibold">Notele mele</h1>

      {records.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nicio notă înregistrată.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Disciplină</th>
                <th className="p-3 font-medium">Notă</th>
                <th className="p-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {records.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="p-3">{g.subject}</td>
                  <td className="p-3">{g.grade}</td>
                  <td className="p-3">{g.gradedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
