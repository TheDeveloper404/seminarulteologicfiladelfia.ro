"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SortableHeader } from "@/components/app-shell/sortable-header";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  deleteGraduationDocument,
  generateGraduationDocument,
  type GenerateDocumentState,
} from "@/lib/documents/actions";

type GraduateRow = {
  id: number;
  publicId: string;
  fullName: string;
  enrollmentYear: number;
  graduatedAt: Date | null;
  isHistoricalImport: boolean;
  notes: string | null;
};

type DocumentSummary = {
  id: number;
  type: "diploma" | "certificat";
  issueNumber: string;
  issueDate: string;
};

type GradeSummary = { id: number; subject: string; grade: string; gradedAt: string };

function GenerateDocumentForm({ studentId }: { studentId: number }) {
  const action = generateGraduationDocument.bind(null, studentId);
  const [state, formAction, isPending] = useActionState<GenerateDocumentState, FormData>(
    action,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  function handlePreview() {
    const formData = new FormData(formRef.current ?? undefined);
    const params = new URLSearchParams({
      studentId: String(studentId),
      type: String(formData.get("type") ?? "diploma"),
      issueNumber: String(formData.get("issueNumber") ?? ""),
      issueDate: String(formData.get("issueDate") ?? ""),
    });
    window.open(`/api/documente/previzualizare?${params.toString()}`, "_blank", "noopener");
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-lg border p-3">
      <p className="text-base font-medium text-foreground">Generează document nou</p>
      <div className="flex flex-col gap-1.5">
        <Label className="text-base">Tip document</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-base">
            <input type="radio" name="type" value="diploma" defaultChecked className="size-5" />
            Diplomă
          </label>
          <label className="flex items-center gap-2 text-base">
            <input type="radio" name="type" value="certificat" className="size-5" />
            Certificat
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`issueNumber-${studentId}`} className="text-base">
          Nr. de înregistrare
        </Label>
        <Input id={`issueNumber-${studentId}`} name="issueNumber" required className="h-11 md:text-base" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`issueDate-${studentId}`} className="text-base">
          Data eliberării
        </Label>
        <Input
          id={`issueDate-${studentId}`}
          name="issueDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
          className="h-11 md:text-base"
        />
      </div>
      {state && "error" in state && (
        <p className="text-base text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p className="text-base text-emerald-600">Document generat.</p>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handlePreview}>
          <Eye className="size-4" aria-hidden="true" />
          Previzualizează
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Se generează..." : "Generează"}
        </Button>
      </div>
    </form>
  );
}

function DocumentsList({ documents }: { documents: DocumentSummary[] }) {
  if (documents.length === 0) {
    return <p className="text-base text-muted-foreground">Niciun document generat încă.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-base"
        >
          <span>
            {doc.type === "diploma" ? "Diplomă" : "Certificat"} · Nr. {doc.issueNumber} din{" "}
            {new Date(doc.issueDate).toLocaleDateString("ro-RO")}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              render={<a href={`/api/documente/${doc.id}`} />}
              nativeButton={false}
              title="Descarcă"
            >
              <Download className="size-4" aria-hidden="true" />
            </Button>
            <ConfirmDeleteDialog
              title={`Ștergi ${doc.type === "diploma" ? "diploma" : "certificatul"} Nr. ${doc.issueNumber}?`}
              description="Documentul generat va fi șters definitiv. Nu se poate anula."
              onConfirm={() => deleteGraduationDocument(doc.id)}
              trigger={<Button type="button" variant="ghost" size="icon" title="Șterge" />}
              triggerContent={<Trash2 className="size-4" aria-hidden="true" />}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

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
  documents,
}: {
  student: GraduateRow;
  grades: GradeSummary[];
  documents: DocumentSummary[];
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

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{student.fullName}</DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 text-base">
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
          <p className="text-base font-medium text-foreground">Note</p>
          {grades.length === 0 ? (
            <p className="mt-1 text-base text-muted-foreground">Nicio notă înregistrată.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {grades.map((g) => (
                <li key={g.id} className="flex items-center justify-between text-base">
                  <span className="text-foreground">{g.subject}</span>
                  <span className="text-muted-foreground">
                    {g.grade} · {new Date(g.gradedAt).toLocaleDateString("ro-RO")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {student.isHistoricalImport ? (
          <div>
            <p className="text-base font-medium text-foreground">
              Rând istoric (arhivă pe hârtie)
            </p>
            <p className="mt-1 text-base text-muted-foreground">
              {student.notes || "Fără observații."} Nu are cont de portal și nu poate primi
              diplomă/certificat generat.
            </p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-base font-medium text-foreground">Documente generate</p>
              <div className="mt-2">
                <DocumentsList documents={documents} />
              </div>
            </div>
            <GenerateDocumentForm studentId={student.id} />
          </>
        )}

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
  documentsByStudent,
}: {
  groups: [string, GraduateRow[]][];
  gradesByStudent: Record<number, GradeSummary[]>;
  documentsByStudent: Record<number, DocumentSummary[]>;
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

      <Accordion
        multiple
        defaultValue={sortedGroups[0] ? [sortedGroups[0][0]] : []}
      >
        {sortedGroups.map(([year, yearGraduates]) => (
          <AccordionItem key={year} value={year}>
            <AccordionTrigger>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {year} <span className="text-muted-foreground">({yearGraduates.length})</span>
              </h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {yearGraduates.map((student) => (
                  <GraduateCard
                    key={student.id}
                    student={student}
                    grades={gradesByStudent[student.id] ?? []}
                    documents={documentsByStudent[student.id] ?? []}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
