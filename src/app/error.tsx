"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        A apărut o eroare neașteptată
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Te rugăm să încerci din nou. Dacă problema persistă, contactează-ne.
      </p>
      <Button className="mt-6" onClick={reset}>
        Încearcă din nou
      </Button>
    </div>
  );
}
