import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShellNav } from "./app-shell-nav";

type NavItem = {
  href: string;
  label: string;
};

export function AppShell({
  brand,
  brandHref,
  navItems,
  logoutAction,
  children,
}: {
  brand: string;
  brandHref: string;
  navItems: NavItem[];
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={brandHref}
              className="flex items-center gap-2 font-heading text-sm font-semibold"
            >
              <GraduationCap className="size-5 text-primary" aria-hidden="true" />
              {brand}
            </Link>
            <AppShellNav items={navItems} />
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Delogare
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
