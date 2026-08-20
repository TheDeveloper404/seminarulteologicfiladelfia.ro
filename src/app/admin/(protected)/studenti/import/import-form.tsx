"use client";

import { useActionState, useRef } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importStudentsFromRegistry, type ImportState } from "@/lib/students/import-actions";
import { REGISTRY_COLUMNS } from "@/lib/students/registry-columns";

const currentYear = new Date().getFullYear();

export function ImportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ImportState, FormData>(
    async (prevState, formData) => {
      const result = await importStudentsFromRegistry(prevState, formData);
      // Golim doar câmpul de fișier (nu și anul de înscriere, util pentru un al doilea fișier
      // din același an) — altfel un al doilea click pe „Importă” retrimite din greșeală fișierul
      // deja procesat, încă afișat în selector.
      if (result && "created" in result) {
        const fileInput = formRef.current?.elements.namedItem("file");
        if (fileInput instanceof HTMLInputElement) fileInput.value = "";
      }
      return result;
    },
    null
  );

  const hasError = state && "error" in state;
  const hasResult = state && "created" in state;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-muted/30 p-4 text-base">
        <p className="font-medium">Coloane așteptate, în această ordine (rândul 1 = antet):</p>
        <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-muted-foreground">
          {REGISTRY_COLUMNS.map((col) => (
            <li key={col}>{col}</li>
          ))}
        </ol>
        <p className="mt-2 text-muted-foreground">
          Doar „Nume” este obligatoriu — restul coloanelor pot rămâne goale. Anul de studiu se
          setează automat pe „Anul I” pentru toți studenții importați.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enrollmentYear" className="text-base">
            An înscriere (se aplică tuturor rândurilor din fișier)
          </Label>
          <Input
            id="enrollmentYear"
            name="enrollmentYear"
            type="number"
            required
            defaultValue={currentYear}
            min={2000}
            max={2100}
            className="h-11 w-40 md:text-base"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="file" className="text-base">
            Fișier registru (.xlsx, .xls sau .csv)
          </Label>
          <input
            id="file"
            name="file"
            type="file"
            required
            accept=".xlsx,.xls,.csv"
            className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-base file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
          />
        </div>

        {hasError && (
          <p className="flex items-center gap-2 text-base text-destructive" role="alert">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-fit text-base" disabled={isPending}>
          {isPending ? "Se importă..." : "Importă studenți"}
        </Button>
      </form>

      {hasResult && (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <p className="flex items-center gap-2 text-base font-medium text-foreground">
            <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
            {state.created} student{state.created === 1 ? "" : "i"} importat
            {state.created === 1 ? "" : "ți"} cu succes.
          </p>
          {state.skipped.length > 0 && (
            <div>
              <p className="text-base font-medium">
                {state.skipped.length} rând{state.skipped.length === 1 ? "" : "uri"} sărit
                {state.skipped.length === 1 ? "" : "e"}:
              </p>
              <ul className="mt-1.5 space-y-1 text-base text-muted-foreground">
                {state.skipped.map((issue, i) => (
                  <li key={i}>
                    Rândul {issue.rowNumber}: {issue.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
