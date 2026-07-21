"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAlbum, type AlbumFormState } from "@/lib/gallery/actions";

export function CreateAlbumForm() {
  const [state, formAction, isPending] = useActionState<AlbumFormState, FormData>(
    createAlbum,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title" className="text-base">
          Titlu album
        </Label>
        <Input id="title" name="title" className="h-11 md:text-base" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="year" className="text-base">
          An
        </Label>
        <Input
          id="year"
          name="year"
          type="number"
          defaultValue={new Date().getFullYear()}
          className="h-11 md:text-base"
          required
        />
      </div>
      {state?.error && (
        <p className="text-base text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="text-base" disabled={isPending}>
        {isPending ? "Se creează..." : "Creează album"}
      </Button>
    </form>
  );
}
