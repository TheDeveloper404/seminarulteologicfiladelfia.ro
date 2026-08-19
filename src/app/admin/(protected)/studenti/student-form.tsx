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

const inputClassName = "h-9";
const labelClassName = "text-xs";

function Field({
  htmlFor,
  label,
  full,
  children,
}: {
  htmlFor: string;
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${full ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </Label>
      {children}
    </div>
  );
}

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
      <div>
        <h2 className="mb-2 font-heading text-sm font-semibold text-foreground">
          Date generale
        </h2>
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {mode === "edit" && (
            <Field htmlFor="publicId" label="ID student">
              <p id="publicId" className="font-mono text-sm leading-9">
                {student.publicId}
              </p>
            </Field>
          )}
          <Field htmlFor="fullName" label="Nume complet" full>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={mode === "edit" ? student.fullName : undefined}
              className={inputClassName}
              required
            />
          </Field>
          <Field htmlFor="phone" label="Telefon (opțional)">
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={mode === "edit" ? (student.phone ?? "") : undefined}
              className={inputClassName}
            />
          </Field>
          <Field htmlFor="email" label="Email (opțional)">
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={mode === "edit" ? (student.email ?? "") : undefined}
              className={inputClassName}
            />
          </Field>
          <Field htmlFor="enrollmentYear" label="An înscriere">
            <Input
              id="enrollmentYear"
              name="enrollmentYear"
              type="number"
              defaultValue={mode === "edit" ? student.enrollmentYear : new Date().getFullYear()}
              className={inputClassName}
              required
            />
          </Field>
          <div className="flex flex-col gap-1">
            <Label className={labelClassName}>An de studiu</Label>
            <div className="flex h-9 items-center gap-4">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="studyYear"
                  value="1"
                  defaultChecked={mode === "create" || student.studyYear === 1}
                  className="size-4"
                />
                Anul I
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="studyYear"
                  value="2"
                  defaultChecked={mode === "edit" && student.studyYear === 2}
                  className="size-4"
                />
                Anul II
              </label>
            </div>
          </div>
          {mode === "edit" && (
            <>
              <div className="flex flex-col gap-1">
                <Label className={labelClassName}>Absolvent</Label>
                <div className="flex h-9 items-center">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      name="graduated"
                      defaultChecked={student.graduated}
                      className="size-4"
                    />
                    Absolvent
                  </label>
                </div>
              </div>
              <Field htmlFor="graduatedAt" label="Data absolvirii">
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
              </Field>
            </>
          )}
        </div>
      </div>

      {mode === "edit" && (
        <div>
          <h2 className="mb-2 font-heading text-sm font-semibold text-foreground">
            Date pentru diplomă/certificat (opțional)
          </h2>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field htmlFor="birthDate" label="Data nașterii">
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                defaultValue={
                  student.birthDate
                    ? new Date(student.birthDate).toISOString().slice(0, 10)
                    : ""
                }
                className={inputClassName}
              />
            </Field>
            <Field htmlFor="birthLocality" label="Localitatea nașterii">
              <Input
                id="birthLocality"
                name="birthLocality"
                defaultValue={student.birthLocality ?? ""}
                className={inputClassName}
              />
            </Field>
            <Field htmlFor="birthCounty" label="Județul nașterii">
              <Input
                id="birthCounty"
                name="birthCounty"
                defaultValue={student.birthCounty ?? ""}
                className={inputClassName}
              />
            </Field>
            <Field htmlFor="baptismDate" label="Data botezului">
              <Input
                id="baptismDate"
                name="baptismDate"
                type="date"
                defaultValue={
                  student.baptismDate
                    ? new Date(student.baptismDate).toISOString().slice(0, 10)
                    : ""
                }
                className={inputClassName}
              />
            </Field>
            <Field htmlFor="homeChurch" label="Biserica locală">
              <Input
                id="homeChurch"
                name="homeChurch"
                defaultValue={student.homeChurch ?? ""}
                className={inputClassName}
              />
            </Field>
            <Field htmlFor="address" label="Adresă">
              <Input
                id="address"
                name="address"
                defaultValue={student.address ?? ""}
                className={inputClassName}
              />
            </Field>
            <Field htmlFor="notes" label="Observații" full>
              <Input
                id="notes"
                name="notes"
                defaultValue={student.notes ?? ""}
                className={inputClassName}
              />
            </Field>
          </div>
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Se salvează..." : mode === "create" ? "Adaugă student" : "Salvează"}
      </Button>
    </form>
  );
}
