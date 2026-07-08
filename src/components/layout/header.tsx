import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { siteConfig } from "@/lib/content/site-config";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-lg font-semibold text-primary">
            {siteConfig.shortName}
          </span>
        </Link>
        <MainNav />
        <MobileNav />
      </div>
    </header>
  );
}
