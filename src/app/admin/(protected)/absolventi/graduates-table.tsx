"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SortableHeader } from "@/components/app-shell/sortable-header";

type GraduateRow = {
  id: number;
  publicId: string;
  fullName: string;
  enrollmentYear: number;
  graduatedAt: Date | null;
};

type SortField = "fullName" | "enrollmentYear";

function sortRows(rows: GraduateRow[], field: SortField, direction: "asc" | "desc") {
  return [...rows].sort((a, b) => {
    const comparison =
      field === "fullName" ? a.fullName.localeCompare(b.fullName, "ro") : a[field] - b[field];
    return direction === "asc" ? comparison : -comparison;
  });
}

export function GraduatesTable({ groups }: { groups: [string, GraduateRow[]][] }) {
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

  const sortedGroups = useMemo(
    () => groups.map(([year, rows]) => [year, sortRows(rows, sortField, sortDirection)] as const),
    [groups, sortField, sortDirection]
  );

  return (
    <div className="mt-6 flex flex-col gap-8">
      {sortedGroups.map(([year, yearGraduates]) => (
        <div key={year}>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {year} <span className="text-muted-foreground">({yearGraduates.length})</span>
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border">
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
                  <th className="p-4 font-medium whitespace-nowrap">Absolvit la</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {yearGraduates.map((student) => (
                  <tr key={student.id} className="border-t">
                    <td className="p-4 font-mono whitespace-nowrap">{student.publicId}</td>
                    <td className="p-4">{student.fullName}</td>
                    <td className="p-4 whitespace-nowrap">{student.enrollmentYear}</td>
                    <td className="p-4 whitespace-nowrap">
                      {student.graduatedAt
                        ? new Date(student.graduatedAt).toLocaleDateString("ro-RO")
                        : "—"}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/studenti/${student.id}`} />}
                        nativeButton={false}
                      >
                        Detalii
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
