import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Casetă de sumar (valoare mare + etichetă), folosită în rândul de statistici din portalul
// studentului. Umple lățimea ecranului pe desktop, unde altfel rămâneau doar tabele înguste.
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-semibold text-foreground">{value}</p>
          {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
