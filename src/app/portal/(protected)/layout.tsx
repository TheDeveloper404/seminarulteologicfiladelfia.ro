import Link from "next/link";
import { requireStudent } from "@/lib/auth/require-student";
import { logoutStudent } from "@/lib/auth/student-actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/portal", label: "Contul meu" },
  { href: "/portal/note", label: "Note" },
  { href: "/portal/prezenta", label: "Prezență" },
  { href: "/portal/materiale", label: "Materiale" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStudent();

  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <nav className="flex items-center gap-4">
          <span className="font-heading text-sm font-medium">Portal studenți</span>
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
        <form action={logoutStudent}>
          <Button type="submit" variant="outline" size="sm">
            Delogare
          </Button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
