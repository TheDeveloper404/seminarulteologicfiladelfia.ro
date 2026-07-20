"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadCourseMaterial, type MaterialFormState } from "@/lib/course-materials/actions";

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<MaterialFormState, FormData>(
    async (prevState, formData) => {
      const result = await uploadCourseMaterial(prevState, formData);
      if (!result) {
        formRef.current?.reset();
      }
      return result;
    },
    null
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Titlu</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descriere (opțional)</Label>
        <Input id="description" name="description" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="file">Fișier</Label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp3,.mp4,.zip"
          className="text-sm"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Se încarcă..." : "Încarcă material"}
      </Button>
    </form>
  );
}
