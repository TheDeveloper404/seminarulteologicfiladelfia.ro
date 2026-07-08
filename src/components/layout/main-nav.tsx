"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/lib/content/site-config";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Meniu principal" className="hidden lg:flex items-center gap-1">
      {mainNav.map((item) => {
        const active = isActive(pathname, item.href);

        if (!item.children) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                active ? "text-primary" : "text-foreground/80"
              )}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <div key={item.href} className="group relative">
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                active ? "text-primary" : "text-foreground/80"
              )}
            >
              {item.label}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="size-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
              >
                <path
                  d="M5.5 7.5l4.5 4.5 4.5-4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <div
              className="invisible absolute left-0 top-full z-50 min-w-56 -translate-y-1 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
            >
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
