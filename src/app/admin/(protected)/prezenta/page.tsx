import { eq } from "drizzle-orm";
import { db } from "@/db";
import { attendance, students } from "@/db/schema";
import { AttendanceCheckbox } from "./attendance-checkbox";

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
      <h1 className="font-heading text-xl font-semibold">Catalog prezență</h1>

      <form className="mt-4 flex items-end gap-2" method="get">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="data" className="text-sm font-medium">
            Data sesiunii
          </label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={sessionDate}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm hover:bg-muted"
        >
          Schimbă data
        </button>
      </form>

      {activeStudents.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Niciun student activ.</p>
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
