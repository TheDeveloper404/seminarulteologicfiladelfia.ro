"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { updateGrade, deleteGrade, type GradeFormState } from "@/lib/grades/actions";

type Grade = {
  id: number;
  subject: string;
  grade: string;
  gradedAt: string;
};

export function GradeRow({ studentId, grade }: { studentId: number; grade: Grade }) {
  const [editing, setEditing] = useState(false);
  const action = updateGrade.bind(null, grade.id, studentId);
  const [state, formAction, isPending] = useActionState<GradeFormState, FormData>(action, null);
  const wasPending = useRef(false);

  // Închide formularul de editare automat după un salvare reușită (tranziția pending -> not
  // pending, fără eroare) — altfel `editing` rămâne `true` peste revalidarea din server, iar
  // adminul vede formularul deschis chiar dacă nota s-a salvat deja.
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  if (editing) {
    return (
      <tr className="border-t">
        <td colSpan={4} className="p-4">
          <form action={formAction} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`subject-${grade.id}`} className="text-sm font-medium">
                Disciplină
              </label>
              <Input
                id={`subject-${grade.id}`}
                name="subject"
                defaultValue={grade.subject}
                className="h-10"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`grade-${grade.id}`} className="text-sm font-medium">
                Notă
              </label>
              <Input
                id={`grade-${grade.id}`}
                name="grade"
                type="number"
                min="1"
                max="10"
                step="0.01"
                defaultValue={grade.grade}
                className="h-10 w-24"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`gradedAt-${grade.id}`} className="text-sm font-medium">
                Data
              </label>
              <Input
                id={`gradedAt-${grade.id}`}
                name="gradedAt"
                type="date"
                defaultValue={grade.gradedAt}
                className="h-10"
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Se salvează..." : "Salvează"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
              <X className="size-4" aria-hidden="true" />
              Anulează
            </Button>
          </form>
          {state?.error && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t">
      <td className="p-4">{grade.subject}</td>
      <td className="p-4 whitespace-nowrap">{grade.grade}</td>
      <td className="p-4 whitespace-nowrap">{grade.gradedAt}</td>
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editează
          </Button>
          <ConfirmDeleteDialog
            title="Ștergi această notă?"
            description={`Ștergi definitiv nota la „${grade.subject}” (${grade.grade}). Nu se poate anula.`}
            onConfirm={() => deleteGrade(grade.id, studentId)}
          />
        </div>
      </td>
    </tr>
  );
}
