"use client";

import { useMemo, useState } from "react";
import { SortableHeader } from "@/components/app-shell/sortable-header";
import { AttendanceCheckbox } from "./attendance-checkbox";

type StudentRow = {
  id: number;
  publicId: string;
  fullName: string;
  enrollmentYear: number;
  studyYear: number;
};

type SortField = "fullName" | "enrollmentYear" | "studyYear";

export function AttendanceTable({
  students,
  presentByStudentId,
  sessionDate,
}: {
  students: StudentRow[];
  presentByStudentId: Record<number, boolean>;
  sessionDate: string;
}) {
  const [sortField, setSortField] = useState<SortField>("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const sorted = useMemo(() => {
    return [...students].sort((a, b) => {
      let comparison = 0;
      if (sortField === "fullName") {
        comparison = a.fullName.localeCompare(b.fullName, "ro");
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [students, sortField, sortDirection]);

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border">
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
            <th className="p-4 font-medium whitespace-nowrap">Prezent</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((student) => (
            <tr key={student.id} className="border-t">
              <td className="p-4 font-mono whitespace-nowrap">{student.publicId}</td>
              <td className="p-4">{student.fullName}</td>
              <td className="p-4 whitespace-nowrap">{student.enrollmentYear}</td>
              <td className="p-4 whitespace-nowrap">
                {student.studyYear === 2 ? "Anul II" : "Anul I"}
              </td>
              <td className="p-4 whitespace-nowrap">
                <AttendanceCheckbox
                  key={sessionDate}
                  studentId={student.id}
                  sessionDate={sessionDate}
                  initialPresent={presentByStudentId[student.id] ?? false}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
