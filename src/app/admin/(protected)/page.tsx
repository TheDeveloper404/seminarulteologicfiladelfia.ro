import Link from "next/link";
import { Users, GraduationCap, FileText, CalendarCheck } from "lucide-react";
import { db } from "@/db";
import { students, courseMaterials } from "@/db/schema";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const allStudents = await db.select().from(students);
  const activeStudents = allStudents.filter((s) => !s.graduated).length;
  const graduatedStudents = allStudents.filter((s) => s.graduated).length;
  const materials = await db.select().from(courseMaterials);

  const stats = [
    {
      label: "Studenți activi",
      value: activeStudents,
      icon: Users,
      href: "/admin/studenti",
    },
    {
      label: "Absolvenți",
      value: graduatedStudents,
      icon: GraduationCap,
      href: "/admin/absolventi",
    },
    {
      label: "Materiale de curs",
      value: materials.length,
      icon: FileText,
      href: "/admin/materiale",
    },
    {
      label: "Prezență",
      value: "Catalog",
      icon: CalendarCheck,
      href: "/admin/prezenta",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panou de control"
        description="Prezența, materialele de curs și notele studenților, dintr-un singur loc."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 py-2">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="size-6 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-3xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-base text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
