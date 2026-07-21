"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadCourseMaterial, type MaterialFormState } from "@/lib/course-materials/actions";

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<MaterialFormState, FormData>(
    async (prevState, formData) => {
      const result = await uploadCourseMaterial(prevState, formData);
      if (!result) {
        formRef.current?.reset();
        setSelectedFileName(null);
      }
      return result;
    },
    null
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    if (titleInputRef.current && !titleInputRef.current.value.trim()) {
      titleInputRef.current.value = file.name.replace(/\.[^./]+$/, "");
    }
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Titlu</Label>
        <Input
          id="title"
          name="title"
          ref={titleInputRef}
          placeholder="Se completează automat din numele fișierului"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descriere (opțional)</Label>
        <Input id="description" name="description" />
      </div>
      <input
        ref={fileInputRef}
        id="file"
        name="file"
        type="file"
        required
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp3,.mp4,.zip"
        className="hidden"
        onChange={handleFileChange}
      />
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button
        type="button"
        disabled={isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {isPending
          ? "Se încarcă..."
          : selectedFileName
            ? `Selectat: ${selectedFileName}`
            : "Alege și încarcă material"}
      </Button>
    </form>
  );
}
