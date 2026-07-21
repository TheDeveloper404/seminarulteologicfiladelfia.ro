import { requireStudent } from "@/lib/auth/require-student";
import { logoutStudent } from "@/lib/auth/student-actions";
import { AppShell } from "@/components/app-shell/app-shell";

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
    <AppShell
      brand="Portal studenți"
      brandHref="/portal"
      navItems={NAV_ITEMS}
      logoutAction={logoutStudent}
    >
      {children}
    </AppShell>
  );
}
