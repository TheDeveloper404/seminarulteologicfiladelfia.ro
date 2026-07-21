"use client";

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deleteAlbum } from "@/lib/gallery/actions";

export function DeleteAlbumButton({
  albumId,
  albumTitle,
}: {
  albumId: number;
  albumTitle: string;
}) {
  return (
    <ConfirmDeleteDialog
      title="Ștergi acest album?"
      description={`Ștergi definitiv albumul „${albumTitle}", inclusiv toate pozele din el. Nu se poate anula.`}
      onConfirm={() => deleteAlbum(albumId)}
    />
  );
}
