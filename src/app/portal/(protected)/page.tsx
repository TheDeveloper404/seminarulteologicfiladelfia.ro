import Link from "next/link";
import { eq } from "drizzle-orm";
import { NotebookText, CalendarCheck, FileText } from "lucide-react";
import { db } from "@/db";
import { students } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function PortalDashboardPage() {
  const session = await getSession("student");
  const [student] = session
    ? await db.select().from(students).where(eq(students.id, session.studentId!))
    : [];

  const links = [
    { label: "Note", href: "/portal/note", icon: NotebookText },
    { label: "Prezență", href: "/portal/prezenta", icon: CalendarCheck },
    { label: "Materiale de curs", href: "/portal/materiale", icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={student ? `Bine ai venit, ${student.fullName}` : "Contul meu"}
        description={
          student
            ? `ID student: ${student.publicId} · An înscriere ${student.enrollmentYear}`
            : undefined
        }
      />

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 py-2">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <link.icon className="size-6 text-primary" aria-hidden="true" />
                </div>
                <p className="text-base font-medium text-foreground">{link.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
