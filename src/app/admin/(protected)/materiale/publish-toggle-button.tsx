"use client";

import { useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setMaterialPublished } from "@/lib/course-materials/actions";

export function PublishToggleButton({
  materialId,
  published,
}: {
  materialId: number;
  published: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={published ? "outline" : "default"}
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await setMaterialPublished(materialId, !published);
        });
      }}
    >
      {published ? (
        <>
          <EyeOff className="size-4" aria-hidden="true" />
          {isPending ? "Se ascunde..." : "Ascunde"}
        </>
      ) : (
        <>
          <Eye className="size-4" aria-hidden="true" />
          {isPending ? "Se publică..." : "Publică"}
        </>
      )}
    </Button>
  );
}
