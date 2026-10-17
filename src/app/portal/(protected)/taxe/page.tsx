import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { getStudentTuition } from "@/lib/tuition/queries";

export const metadata: Metadata = { title: "Taxele mele", robots: { index: false, follow: false } };

export default async function StudentTuitionPage() {
  const rows = await getStudentTuition();
  return (
    <div>
      <PageHeader title="Taxele mele" description="Situația taxelor de școlarizare, actualizată de administrația seminarului." />
      {rows.length === 0 ? (
        <EmptyState icon={Wallet} title="Nicio taxă înregistrată" description="Lunile adăugate de administrație și statusul plăților tale vor apărea aici." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-base">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-4 font-medium">Luna</th>
                <th className="p-4 text-right font-medium">Sumă</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="border-t">
                  <td className="p-4 capitalize">{new Date(`${row.month}T12:00:00Z`).toLocaleDateString("ro-RO", { month: "long", year: "numeric", timeZone: "Europe/Bucharest" })}</td>
                  <td className="p-4 text-right whitespace-nowrap">{row.amount} lei</td>
                  <td className="p-4"><Badge variant={row.paid ? "default" : "secondary"}>{row.paid ? "Plătit" : "Neplătit"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
