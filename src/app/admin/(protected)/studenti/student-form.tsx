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

const inputClassName = "h-11 md:text-base";
const labelClassName = "text-base";

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
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "edit" && (
        <div className="flex flex-col gap-1.5">
          <Label className={labelClassName}>ID student</Label>
          <p className="font-mono text-base">{student.publicId}</p>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName" className={labelClassName}>
          Nume complet
        </Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={mode === "edit" ? student.fullName : undefined}
          className={inputClassName}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone" className={labelClassName}>
          Telefon (opțional)
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={mode === "edit" ? (student.phone ?? "") : undefined}
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className={labelClassName}>
          Email (opțional)
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={mode === "edit" ? (student.email ?? "") : undefined}
          className={inputClassName}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="enrollmentYear" className={labelClassName}>
          An înscriere
        </Label>
        <Input
          id="enrollmentYear"
          name="enrollmentYear"
          type="number"
          defaultValue={mode === "edit" ? student.enrollmentYear : new Date().getFullYear()}
          className={inputClassName}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className={labelClassName}>An de studiu</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-base">
            <input
              type="radio"
              name="studyYear"
              value="1"
              defaultChecked={mode === "create" || student.studyYear === 1}
              className="size-5"
            />
            Anul I
          </label>
          <label className="flex items-center gap-2 text-base">
            <input
              type="radio"
              name="studyYear"
              value="2"
              defaultChecked={mode === "edit" && student.studyYear === 2}
              className="size-5"
            />
            Anul II
          </label>
        </div>
      </div>
      {mode === "edit" && (
        <>
          <label className="flex items-center gap-2 text-base">
            <input
              type="checkbox"
              name="graduated"
              defaultChecked={student.graduated}
              className="size-5"
            />
            Absolvent
          </label>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="graduatedAt" className={labelClassName}>
              Data absolvirii (dacă e cazul)
            </Label>
            <Input
              id="graduatedAt"
              name="graduatedAt"
              type="date"
              defaultValue={
                student.graduatedAt
                  ? new Date(student.graduatedAt).toISOString().slice(0, 10)
                  : ""
              }
              className={inputClassName}
            />
          </div>
        </>
      )}
      {state?.error && (
        <p className="text-base text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="text-base" disabled={isPending}>
        {isPending ? "Se salvează..." : mode === "create" ? "Adaugă student" : "Salvează"}
      </Button>
    </form>
  );
}
