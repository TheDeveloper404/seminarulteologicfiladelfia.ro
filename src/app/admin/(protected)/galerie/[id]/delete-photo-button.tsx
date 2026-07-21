"use client";

import { X } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deletePhoto } from "@/lib/gallery/actions";

export function DeletePhotoButton({ photoId }: { photoId: number }) {
  return (
    <ConfirmDeleteDialog
      title="Ștergi această poză?"
      description="Nu se poate anula."
      onConfirm={() => deletePhoto(photoId)}
      trigger={
        <button
          type="button"
          aria-label="Șterge poza"
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive focus-visible:opacity-100"
        />
      }
      triggerContent={<X className="size-4" aria-hidden="true" />}
    />
  );
}
