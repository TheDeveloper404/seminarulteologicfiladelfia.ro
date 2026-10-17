"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createTuitionMonth, setTuitionPaid, type TuitionFormState } from "@/lib/tuition/actions";

export function TuitionMonthForm({ month }: { month: string }) {
  const [state, formAction, pending] = useActionState<TuitionFormState, FormData>(createTuitionMonth, null);
  return (
    <form action={formAction} className="mt-6 space-y-3">
      <input type="hidden" name="month" value={month} />
      <p className="text-base text-muted-foreground">
        Luna nu este încă adăugată. Taxa se aplică studenților neabsolvenți existenți acum;
        înscrierile ulterioare nu modifică această lună.
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Se adaugă..." : "Adaugă luna — 60 lei/student"}
      </Button>
      {state?.error && <p role="alert" className="text-base text-destructive">{state.error}</p>}
    </form>
  );
}

export function TuitionPaymentForm({ feeId, paid }: { feeId: number; paid: boolean }) {
  const [state, formAction, pending] = useActionState<TuitionFormState, FormData>(
    setTuitionPaid.bind(null, feeId, !paid), null
  );
  return (
    <form action={formAction} className="space-y-2">
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Se salvează..." : paid ? "Marchează neplătit" : "Marchează plătit"}
      </Button>
      {state?.error && <p role="alert" className="text-base text-destructive">{state.error}</p>}
      {state?.success && <p role="status" className="text-base text-muted-foreground">{state.success}</p>}
    </form>
  );
}
