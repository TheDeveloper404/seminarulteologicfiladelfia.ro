"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatLongDate(sessionDate: string): string {
  const formatted = dateFormatter.format(new Date(`${sessionDate}T00:00:00Z`));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function AttendanceFormStrip({
  records,
}: {
  records: { sessionDate: string; present: boolean }[];
}) {
  if (records.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Tooltip.Provider delay={80} closeDelay={0}>
      <div className="flex gap-1">
        {records.map((record) => {
          const label = `${formatLongDate(record.sessionDate)} — ${record.present ? "prezent" : "absent"}`;
          return (
            <Tooltip.Root key={record.sessionDate}>
              <Tooltip.Trigger
                aria-label={label}
                className={cn(
                  "size-3.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  record.present ? "bg-emerald-500" : "bg-destructive/70"
                )}
              />
              <Tooltip.Portal>
                <Tooltip.Positioner side="top" sideOffset={8} className="z-50">
                  <Tooltip.Popup className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background shadow-lg transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2.5 rounded-sm",
                        record.present ? "bg-emerald-400" : "bg-red-400"
                      )}
                    />
                    <span>{formatLongDate(record.sessionDate)}</span>
                    <span className="text-background/70">
                      {record.present ? "Prezent" : "Absent"}
                    </span>
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
}
