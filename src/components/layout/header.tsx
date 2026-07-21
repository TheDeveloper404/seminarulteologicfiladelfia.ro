import Image from "next/image";
import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content/site-config";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logoheader.png"
            alt=""
            width={642}
            height={644}
            priority
            className="h-9 w-auto"
          />
          <span className="hidden font-heading text-lg font-semibold whitespace-nowrap text-primary sm:inline">
            {siteConfig.name}
          </span>
        </Link>
        <MainNav />
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/portal/login" />}
            nativeButton={false}
          >
            Portal studenți
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
