"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableHeader } from "@/components/app-shell/sortable-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type GraduateRow = {
  id: number;
  publicId: string;
  fullName: string;
  enrollmentYear: number;
  graduatedAt: Date | null;
};

type GradeSummary = { id: number; subject: string; grade: string; gradedAt: string };

type SortField = "fullName";

function sortRows(rows: GraduateRow[], direction: "asc" | "desc") {
  return [...rows].sort((a, b) => {
    const comparison = a.fullName.localeCompare(b.fullName, "ro");
    return direction === "asc" ? comparison : -comparison;
  });
}

function GraduateCard({
  student,
  grades,
}: {
  student: GraduateRow;
  grades: GradeSummary[];
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-lg border bg-card p-4 text-left hover:bg-muted/50"
          />
        }
      >
        <div>
          <p className="font-medium text-foreground">{student.fullName}</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{student.publicId}</p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student.fullName}</DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">An înscriere</dt>
            <dd className="font-medium text-foreground">{student.enrollmentYear}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Absolvit la</dt>
            <dd className="font-medium text-foreground">
              {student.graduatedAt
                ? new Date(student.graduatedAt).toLocaleDateString("ro-RO")
                : "—"}
            </dd>
          </div>
        </dl>

        <div>
          <p className="text-sm font-medium text-foreground">Note</p>
          {grades.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">Nicio notă înregistrată.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {grades.map((g) => (
                <li key={g.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{g.subject}</span>
                  <span className="text-muted-foreground">
                    {g.grade} · {new Date(g.gradedAt).toLocaleDateString("ro-RO")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/admin/studenti/${student.id}`} />}
          nativeButton={false}
        >
          <Pencil className="size-4" aria-hidden="true" />
          Editează
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function GraduatesTable({
  groups,
  gradesByStudent,
}: {
  groups: [string, GraduateRow[]][];
  gradesByStudent: Record<number, GradeSummary[]>;
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

  const sortedGroups = useMemo(
    () => groups.map(([year, rows]) => [year, sortRows(rows, sortDirection)] as const),
    [groups, sortDirection]
  );

  return (
    <div className="mt-6 flex flex-col gap-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Sortează după:</span>
        <SortableHeader
          label="Nume"
          field="fullName"
          activeField={sortField}
          direction={sortDirection}
          onSort={handleSort}
        />
      </div>

      {sortedGroups.map(([year, yearGraduates]) => (
        <div key={year}>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {year} <span className="text-muted-foreground">({yearGraduates.length})</span>
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {yearGraduates.map((student) => (
              <GraduateCard
                key={student.id}
                student={student}
                grades={gradesByStudent[student.id] ?? []}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
