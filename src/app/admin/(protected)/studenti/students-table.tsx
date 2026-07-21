"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortableHeader } from "@/components/app-shell/sortable-header";
import { DeleteStudentButton } from "./delete-student-button";
import { AttendanceCheckbox } from "./attendance-checkbox";
import { AttendanceFormStrip } from "./attendance-form-strip";

type StudentRow = {
  id: number;
  publicId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  enrollmentYear: number;
  studyYear: number;
  graduated: boolean;
  recentAttendance: { sessionDate: string; present: boolean }[];
};

type SortField = "fullName" | "enrollmentYear" | "studyYear";

export function StudentsTable({
  students,
  sessionDate,
  presentByStudentId,
}: {
  students: StudentRow[];
  sessionDate: string;
  presentByStudentId: Record<number, boolean>;
}) {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pendingCount, setPendingCount] = useState(0);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function handlePendingChange(pending: boolean) {
    setPendingCount((count) => count + (pending ? 1 : -1));
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = normalized
      ? students.filter((s) => s.fullName.toLowerCase().includes(normalized))
      : students;

    const sorted = [...base].sort((a, b) => {
      let comparison = 0;
      if (sortField === "fullName") {
        comparison = a.fullName.localeCompare(b.fullName, "ro");
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [students, query, sortField, sortDirection]);

  const hasPendingWrites = pendingCount > 0;

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-end gap-6">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută după nume..."
            className="h-11 pl-10 text-base md:text-base"
            aria-label="Caută student după nume"
          />
        </div>

        <form className="flex flex-wrap items-end gap-3" method="get">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="data" className="text-base font-medium">
              Data sesiunii de prezență
            </label>
            <input
              id="data"
              name="data"
              type="date"
              defaultValue={sessionDate}
              className="h-11 rounded-lg border border-input bg-background px-3 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={hasPendingWrites}
            title={
              hasPendingWrites
                ? "Se salvează prezența — așteaptă să se termine înainte de a schimba data."
                : undefined
            }
            className="h-11 rounded-lg border border-input bg-background px-4 text-base font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasPendingWrites ? "Se salvează..." : "Schimbă data"}
          </button>
        </form>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-base text-muted-foreground">
          Niciun student nu corespunde căutării „{query}”.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-base">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-4 font-medium whitespace-nowrap">ID</th>
                <th className="w-full p-4 font-medium">
                  <SortableHeader
                    label="Nume"
                    field="fullName"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4 font-medium whitespace-nowrap">Contact</th>
                <th className="p-4 font-medium whitespace-nowrap">
                  <SortableHeader
                    label="An înscriere"
                    field="enrollmentYear"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4 font-medium whitespace-nowrap">
                  <SortableHeader
                    label="An studiu"
                    field="studyYear"
                    activeField={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="p-4" />
                <th className="p-4 font-medium whitespace-nowrap">Prezent azi</th>
                <th className="p-4 font-medium whitespace-nowrap">Istoric (ultimele 10)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-4 font-mono whitespace-nowrap">{student.publicId}</td>
                  <td className="p-4">{student.fullName}</td>
                  <td className="p-4 whitespace-nowrap text-muted-foreground">
                    {student.phone || student.email || "—"}
                  </td>
                  <td className="p-4 whitespace-nowrap">{student.enrollmentYear}</td>
                  <td className="p-4 whitespace-nowrap">
                    {student.studyYear === 2 ? "Anul II" : "Anul I"}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/studenti/${student.id}/note`} />}
                        nativeButton={false}
                      >
                        Note
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/studenti/${student.id}`} />}
                        nativeButton={false}
                      >
                        Editează
                      </Button>
                      <DeleteStudentButton studentId={student.id} studentName={student.fullName} />
                    </div>
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <AttendanceCheckbox
                      key={sessionDate}
                      studentId={student.id}
                      sessionDate={sessionDate}
                      initialPresent={presentByStudentId[student.id] ?? false}
                      onPendingChange={handlePendingChange}
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <AttendanceFormStrip records={student.recentAttendance} />
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
