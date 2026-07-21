"use client";

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deleteCourseMaterial } from "@/lib/course-materials/actions";

export function DeleteMaterialButton({
  materialId,
  materialTitle,
}: {
  materialId: number;
  materialTitle: string;
}) {
  return (
    <ConfirmDeleteDialog
      title="Ștergi acest material?"
      description={`Ștergi definitiv materialul „${materialTitle}”, inclusiv fișierul. Nu se poate anula.`}
      onConfirm={() => deleteCourseMaterial(materialId)}
    />
  );
}
