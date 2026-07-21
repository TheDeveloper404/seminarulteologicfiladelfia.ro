"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createStudent,
  updateStudent,
  type StudentFormState,
} from "@/lib/students/actions";
import type { students } from "@/db/schema";

type Student = typeof students.$inferSelect;

export function StudentForm({
  mode,
  student,
}: {
  mode: "create";
  student?: never;
} | {
  mode: "edit";
  student: Student;
}) {
  const action = mode === "create" ? createStudent : updateStudent.bind(null, student.id);
  const [state, formAction, isPending] = useActionState<StudentFormState, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {mode === "edit" && (
        <div className="flex flex-col gap-1.5">
          <Label>ID student</Label>
          <p className="font-mono text-sm">{student.publicId}</p>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nume complet</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={mode === "edit" ? student.fullName : undefined}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefon (opțional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={mode === "edit" ? (student.phone ?? "") : undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email (opțional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={mode === "edit" ? (student.email ?? "") : undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="enrollmentYear">An înscriere</Label>
        <Input
          id="enrollmentYear"
          name="enrollmentYear"
          type="number"
          defaultValue={mode === "edit" ? student.enrollmentYear : new Date().getFullYear()}
          required
        />
      </div>
      {mode === "edit" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="graduated"
            defaultChecked={student.graduated}
            className="size-4"
          />
          Absolvent
        </label>
      )}
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Se salvează..." : mode === "create" ? "Adaugă student" : "Salvează"}
      </Button>
    </form>
  );
}
