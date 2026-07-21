import { cn } from "@/lib/utils";

export function AttendanceFormStrip({
  records,
}: {
  records: { sessionDate: string; present: boolean }[];
}) {
  if (records.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex gap-1">
      {records.map((record) => (
        <span
          key={record.sessionDate}
          title={`${record.sessionDate} — ${record.present ? "prezent" : "absent"}`}
          className={cn(
            "size-3.5 rounded-sm",
            record.present ? "bg-emerald-500" : "bg-destructive/70"
          )}
        />
      ))}
    </div>
  );
}
