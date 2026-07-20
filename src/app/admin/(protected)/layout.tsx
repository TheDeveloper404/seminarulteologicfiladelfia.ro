import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logoutAdmin } from "@/lib/auth/admin-actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "Panou" },
  { href: "/admin/studenti", label: "Studenți" },
  { href: "/admin/prezenta", label: "Prezență" },
  { href: "/admin/materiale", label: "Materiale" },
  { href: "/admin/absolventi", label: "Absolvenți" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <nav className="flex items-center gap-4">
          <span className="font-heading text-sm font-medium">Panel admin</span>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAdmin}>
          <Button type="submit" variant="outline" size="sm">
            Delogare
          </Button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
