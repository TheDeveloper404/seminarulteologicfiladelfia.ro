import { requireAdmin } from "@/lib/auth/require-admin";
import { logoutAdmin } from "@/lib/auth/admin-actions";
import { AppShell } from "@/components/app-shell/app-shell";

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
    <AppShell
      brand="Panel admin"
      brandHref="/admin"
      navItems={NAV_ITEMS}
      logoutAction={logoutAdmin}
    >
      {children}
    </AppShell>
  );
}
