"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadGalleryPhoto, type PhotoUploadState } from "@/lib/gallery/actions";

export function UploadPhotosForm({ albumId }: { albumId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const action = uploadGalleryPhoto.bind(null, albumId);
  const [state, formAction, isPending] = useActionState<PhotoUploadState, FormData>(
    async (prevState, formData) => {
      const result = await action(prevState, formData);
      if (!result) {
        formRef.current?.reset();
        setSelectedCount(0);
      }
      return result;
    },
    null
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setSelectedCount(files.length);
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        id="photos"
        name="photos"
        type="file"
        multiple
        required
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {state?.error && (
        <p className="text-base text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button
        type="button"
        size="lg"
        className="text-base"
        disabled={isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {isPending
          ? `Se încarcă${selectedCount ? ` ${selectedCount} poze` : ""}...`
          : "Alege poze și încarcă"}
      </Button>
    </form>
  );
}
