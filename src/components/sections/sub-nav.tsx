"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavChild } from "@/lib/content/types";

interface SubNavProps {
  items: NavChild[];
}

export function SubNav({ items }: SubNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigare secundară"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
