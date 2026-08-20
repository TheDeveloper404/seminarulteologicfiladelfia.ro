import type { Metadata } from "next";
import { ImportForm } from "./import-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Importă studenți din registru",
  robots: { index: false, follow: false },
};

export default function ImportStudentsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Importă studenți din registru"
        description="Încarcă un fișier Excel sau CSV cu coloane fixe — studenții se creează automat, cu ID de portal generat."
      />
      <Card className="mt-6">
        <CardContent className="py-2">
          <ImportForm />
        </CardContent>
      </Card>
    </div>
  );
}
