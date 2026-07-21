import Link from "next/link";
import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShellSidebarNav, AppShellTopNav, type NavItem } from "./app-shell-nav";

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
    <div className="flex min-h-svh bg-muted/30">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r bg-card md:flex">
        <Link
          href={brandHref}
          className="flex items-center gap-2 px-5 py-5 font-heading text-sm font-semibold"
        >
          <GraduationCap className="size-5 text-primary" aria-hidden="true" />
          {brand}
        </Link>
        <div className="flex-1 overflow-y-auto px-3">
          <AppShellSidebarNav items={navItems} rootHref={brandHref} />
        </div>
        <form action={logoutAction} className="border-t p-3">
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="size-4" aria-hidden="true" />
            Delogare
          </Button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-card px-4 py-3 md:hidden">
          <Link
            href={brandHref}
            className="flex items-center gap-2 font-heading text-sm font-semibold"
          >
            <GraduationCap className="size-5 text-primary" aria-hidden="true" />
            {brand}
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Delogare
            </Button>
          </form>
        </header>
        <div className="border-b bg-card px-4 py-2 md:hidden">
          <AppShellTopNav items={navItems} rootHref={brandHref} />
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
