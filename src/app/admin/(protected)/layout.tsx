import { LayoutDashboard, Users, FileText, GraduationCap, Images } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logoutAdmin } from "@/lib/auth/admin-actions";
import { AppShell } from "@/components/app-shell/app-shell";

const NAV_ITEMS = [
  { href: "/admin", label: "Panou", icon: <LayoutDashboard aria-hidden="true" /> },
  { href: "/admin/studenti", label: "Studenți", icon: <Users aria-hidden="true" /> },
  { href: "/admin/materiale", label: "Materiale", icon: <FileText aria-hidden="true" /> },
  { href: "/admin/galerie", label: "Galerie", icon: <Images aria-hidden="true" /> },
  { href: "/admin/absolventi", label: "Absolvenți", icon: <GraduationCap aria-hidden="true" /> },
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
