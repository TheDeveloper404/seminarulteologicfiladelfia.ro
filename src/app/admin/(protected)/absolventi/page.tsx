import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { Button } from "@/components/ui/button";

export default async function GraduatesPage() {
  const graduates = await db
    .select()
    .from(students)
    .where(eq(students.graduated, true))
    .orderBy(desc(students.graduatedAt));

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Arhivă absolvenți</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Un student ajunge aici când e marcat „Absolvent&rdquo; din pagina lui de editare.
      </p>

      {graduates.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Niciun absolvent încă.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Nume</th>
                <th className="p-3 font-medium">An înscriere</th>
                <th className="p-3 font-medium">Absolvit la</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {graduates.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-3 font-mono">{student.publicId}</td>
                  <td className="p-3">{student.fullName}</td>
                  <td className="p-3">{student.enrollmentYear}</td>
                  <td className="p-3">
                    {student.graduatedAt
                      ? new Date(student.graduatedAt).toLocaleDateString("ro-RO")
                      : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/admin/studenti/${student.id}`} />}
                      nativeButton={false}
                    >
                      Detalii
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
