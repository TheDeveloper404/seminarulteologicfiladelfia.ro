"use client";

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deleteStudent } from "@/lib/students/actions";

export function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: number;
  studentName: string;
}) {
  return (
    <ConfirmDeleteDialog
      title="Ștergi acest student?"
      description={`Ștergi definitiv studentul „${studentName}”. Se șterg și prezența, notele și materialele lui asociate. Nu se poate anula.`}
      onConfirm={() => deleteStudent(studentId)}
    />
  );
}
