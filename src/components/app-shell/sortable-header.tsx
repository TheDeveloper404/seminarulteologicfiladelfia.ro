"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export function SortableHeader<T extends string>({
  label,
  field,
  activeField,
  direction,
  onSort,
}: {
  label: string;
  field: T;
  activeField: T;
  direction: "asc" | "desc";
  onSort: (field: T) => void;
}) {
  const isActive = field === activeField;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-medium hover:text-foreground"
    >
      {label}
      {isActive ? (
        direction === "asc" ? (
          <ArrowUp className="size-3.5" aria-hidden="true" />
        ) : (
          <ArrowDown className="size-3.5" aria-hidden="true" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 text-muted-foreground/50" aria-hidden="true" />
      )}
    </button>
  );
}
