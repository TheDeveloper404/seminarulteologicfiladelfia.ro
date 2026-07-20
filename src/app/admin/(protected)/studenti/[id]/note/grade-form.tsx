"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addGrade, type GradeFormState } from "@/lib/grades/actions";

export function GradeForm({ studentId }: { studentId: number }) {
  const action = addGrade.bind(null, studentId);
  const [state, formAction, isPending] = useActionState<GradeFormState, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subject">Disciplină</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="grade">Notă (1-10)</Label>
        <Input id="grade" name="grade" type="number" min="1" max="10" step="0.01" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gradedAt">Data</Label>
        <Input
          id="gradedAt"
          name="gradedAt"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Se salvează..." : "Adaugă notă"}
      </Button>
    </form>
  );
}
