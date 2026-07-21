"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteStudentButton } from "./delete-student-button";

type StudentRow = {
  id: number;
  publicId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  enrollmentYear: number;
  graduated: boolean;
};

export function StudentsTable({ students }: { students: StudentRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return students;
    return students.filter((s) => s.fullName.toLowerCase().includes(normalized));
  }, [students, query]);

  return (
    <div>
      <div className="relative mt-6 max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută după nume..."
          className="pl-9"
          aria-label="Caută student după nume"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Niciun student nu corespunde căutării „{query}&rdquo;.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium whitespace-nowrap">ID</th>
                <th className="w-full p-3 font-medium">Nume</th>
                <th className="p-3 font-medium whitespace-nowrap">Contact</th>
                <th className="p-3 font-medium whitespace-nowrap">An înscriere</th>
                <th className="p-3 font-medium whitespace-nowrap">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-3 font-mono whitespace-nowrap">{student.publicId}</td>
                  <td className="p-3">{student.fullName}</td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {student.phone || student.email || "—"}
                  </td>
                  <td className="p-3 whitespace-nowrap">{student.enrollmentYear}</td>
                  <td className="p-3 whitespace-nowrap">{student.graduated ? "Absolvent" : "Activ"}</td>
                  <td className="p-3 text-right whitespace-nowrap">
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
                      <DeleteStudentButton studentId={student.id} studentName={student.fullName} />
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
