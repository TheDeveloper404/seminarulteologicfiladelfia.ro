import { User, NotebookText, CalendarCheck, FileText } from "lucide-react";
import { requireStudent } from "@/lib/auth/require-student";
import { logoutStudent } from "@/lib/auth/student-actions";
import { AppShell } from "@/components/app-shell/app-shell";

const NAV_ITEMS = [
  { href: "/portal", label: "Contul meu", icon: <User aria-hidden="true" /> },
  { href: "/portal/note", label: "Note", icon: <NotebookText aria-hidden="true" /> },
  { href: "/portal/prezenta", label: "Prezență", icon: <CalendarCheck aria-hidden="true" /> },
  { href: "/portal/materiale", label: "Materiale", icon: <FileText aria-hidden="true" /> },
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
