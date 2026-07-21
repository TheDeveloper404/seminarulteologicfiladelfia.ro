import { eq } from "drizzle-orm";
import { CalendarCheck } from "lucide-react";
import { db } from "@/db";
import { attendance, students } from "@/db/schema";
import { AttendanceCheckbox } from "./attendance-checkbox";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Card } from "@/components/ui/card";

function firstDayOfCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  const sessionDate = data || firstDayOfCurrentMonth();

  const activeStudents = await db
    .select()
    .from(students)
    .where(eq(students.graduated, false));

  const attendanceRecords = await db
    .select()
    .from(attendance)
    .where(eq(attendance.sessionDate, sessionDate));

  const presentByStudentId = new Map(
    attendanceRecords.map((record) => [record.studentId, record.present])
  );

  return (
    <div>
      <PageHeader
        title="Catalog prezență"
        description="Marchează prezența studenților activi pentru sesiunea selectată."
      />

      <Card className="mt-6" size="sm">
        <form className="flex flex-wrap items-end gap-3 px-1" method="get">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="data" className="text-sm font-medium">
              Data sesiunii
            </label>
            <input
              id="data"
              name="data"
              type="date"
              defaultValue={sessionDate}
              className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            Schimbă data
          </button>
        </form>
      </Card>

      {activeStudents.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Niciun student activ"
          description="Adaugă studenți din secțiunea Studenți pentru a putea marca prezența."
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Nume</th>
                <th className="p-3 font-medium">Prezent</th>
              </tr>
            </thead>
            <tbody>
              {activeStudents.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-3 font-mono">{student.publicId}</td>
                  <td className="p-3">{student.fullName}</td>
                  <td className="p-3">
                    <AttendanceCheckbox
                      studentId={student.id}
                      sessionDate={sessionDate}
                      initialPresent={presentByStudentId.get(student.id) ?? false}
                    />
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
