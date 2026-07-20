import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { Button } from "@/components/ui/button";

export default async function StudentsPage() {
  const allStudents = await db
    .select()
    .from(students)
    .orderBy(desc(students.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Studenți</h1>
        <Button render={<Link href="/admin/studenti/nou" />} nativeButton={false}>
          Adaugă student
        </Button>
      </div>

      {allStudents.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Niciun student înregistrat încă.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Nume</th>
                <th className="p-3 font-medium">Contact</th>
                <th className="p-3 font-medium">An înscriere</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {allStudents.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-3 font-mono">{student.publicId}</td>
                  <td className="p-3">{student.fullName}</td>
                  <td className="p-3 text-muted-foreground">
                    {student.phone || student.email || "—"}
                  </td>
                  <td className="p-3">{student.enrollmentYear}</td>
                  <td className="p-3">{student.graduated ? "Absolvent" : "Activ"}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/studenti/${student.id}/note`} />}
                        nativeButton={false}
                      >
                        Note
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/studenti/${student.id}`} />}
                        nativeButton={false}
                      >
                        Editează
                      </Button>
                    </div>
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
