"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { mainNav } from "@/lib/content/site-config";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClassName =
  "relative rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground after:absolute after:inset-x-3.5 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-primary after:transition-opacity";

export function MainNav() {
  const pathname = usePathname();

  return (
    <NavigationMenu className="hidden max-w-none flex-none justify-start 2xl:flex">
      <NavigationMenuList className="justify-start gap-1.5">
        {mainNav.map((item) => {
          const active = isActive(pathname, item.href);

          if (!item.children) {
            return (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  render={<Link href={item.href} />}
                  className={cn(
                    linkClassName,
                    active ? "text-primary after:opacity-100" : "text-foreground/80 after:opacity-0"
                  )}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuTrigger
                className={cn(
                  linkClassName,
                  "h-auto",
                  active ? "text-primary after:opacity-100" : "text-foreground/80 after:opacity-0"
                )}
              >
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-56">
                {item.children.map((child) => {
                  const childActive = isActive(pathname, child.href);
                  return (
                    <NavigationMenuLink
                      key={child.href}
                      render={<Link href={child.href} />}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                        childActive && "bg-accent font-medium text-primary"
                      )}
                    >
                      {child.label}
                    </NavigationMenuLink>
                  );
                })}
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
