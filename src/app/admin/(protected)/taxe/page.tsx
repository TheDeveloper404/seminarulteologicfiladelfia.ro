import { requireAdmin } from "@/lib/auth/require-admin";
import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { todaySessionDate } from "@/lib/attendance/session-date";
import { getAdminTuition } from "@/lib/tuition/queries";
import { TuitionMonthForm, TuitionPaymentForm } from "./tuition-forms";

export const metadata: Metadata = { title: "Taxe de școlarizare", robots: { index: false, follow: false } };

export default async function TuitionPage({ searchParams }: {
  searchParams: Promise<{ luna?: string }>;
}) {
  await requireAdmin();
  const { luna } = await searchParams;
  const valid = luna === undefined || /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(luna);
  const month = valid && luna ? luna : todaySessionDate().slice(0, 7);
  const { month: selectedMonth, rows } = await getAdminTuition(month);

  return (
    <div>
      <PageHeader title="Taxe de școlarizare" description="Evidență lunară — 60 lei/student. Adaugă doar lunile pentru care se percepe taxa." />
      <form action="/admin/taxe" method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tuition-month" className="text-base font-medium">Luna și anul</label>
          <DatePicker id="tuition-month" mode="month" name="luna" defaultValue={month} key={month}
            min="1000-01" max="9999-12" required
            className="h-11 rounded-lg border border-input bg-background px-3 text-base" />
        </div>
        <Button type="submit" variant="outline">Afișează</Button>
      </form>
      {!valid && <p role="alert" className="mt-3 text-base text-destructive">Lună invalidă. Este afișată luna curentă.</p>}
      {!selectedMonth ? <TuitionMonthForm key={month} month={month} /> : rows.length === 0 ? (
        <p className="mt-6 text-base text-muted-foreground">Luna este adăugată, fără studenți înregistrați la momentul creării.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-base">
            <caption className="sr-only">Taxe pentru {month}</caption>
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-4 font-medium whitespace-nowrap">Nr. crt.</th>
                <th className="w-full p-4 font-medium">Student</th>
                <th className="p-4 text-right font-medium">Taxă</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-t">
                  <td className="p-4 text-right">{index + 1}</td>
                  <td className="p-4">{row.fullName}</td>
                  <td className="p-4 text-right whitespace-nowrap">{selectedMonth.amount} lei</td>
                  <td className="p-4"><Badge variant={row.paid ? "default" : "secondary"}>{row.paid ? "Plătit" : "Neplătit"}</Badge></td>
                  <td className="p-4 whitespace-nowrap">
                    <TuitionPaymentForm key={`${row.id}-${row.paid}`} feeId={row.id} paid={row.paid} />
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
