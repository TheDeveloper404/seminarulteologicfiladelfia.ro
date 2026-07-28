"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCourseMaterial, type EditMaterialState } from "@/lib/course-materials/actions";

export function EditMaterialDialog({
  materialId,
  title,
  description,
}: {
  materialId: number;
  title: string;
  description: string | null;
}) {
  const [open, setOpen] = useState(false);
  // Închidem dialogul din wrapper-ul acțiunii, nu dintr-un useEffect pe `state` (ESLint
  // react-hooks/set-state-in-effect) — la momentul ăsta Server Action-ul a confirmat salvarea și
  // revalidatePath a rulat deja, deci lista din spate e actualizată.
  const [state, formAction, isPending] = useActionState<EditMaterialState, FormData>(
    async (prevState, formData) => {
      const result = await updateCourseMaterial(prevState, formData);
      if (result && "ok" in result) setOpen(false);
      return result;
    },
    null
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <Pencil className="size-4" aria-hidden="true" />
        Editează
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <input type="hidden" name="materialId" value={materialId} />
          <DialogHeader>
            <DialogTitle>Editează materialul</DialogTitle>
            <DialogDescription>
              Schimbi titlul și descrierea. Fișierul încărcat rămâne neschimbat.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-title-${materialId}`} className="text-base">
                Titlu
              </Label>
              <Input
                id={`edit-title-${materialId}`}
                name="title"
                defaultValue={title}
                maxLength={255}
                required
                className="h-11 md:text-base"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-description-${materialId}`} className="text-base">
                Descriere (opțional)
              </Label>
              <Textarea
                id={`edit-description-${materialId}`}
                name="description"
                defaultValue={description ?? ""}
                rows={3}
                className="md:text-base"
              />
            </div>
            {state && "error" in state && (
              <p className="text-base text-destructive" role="alert">
                {state.error}
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Anulează
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
