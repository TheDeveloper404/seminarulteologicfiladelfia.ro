import { desc, eq } from "drizzle-orm";
import { Download, FileText } from "lucide-react";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export default async function StudentMaterialsPage() {
  // Doar cele publicate — adminul încarcă materialele în avans, dar le face vizibile manual.
  const materials = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.published, true))
    .orderBy(desc(courseMaterials.uploadedAt));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Materiale de curs"
        description="Materialele publicate de seminar, gata de descărcat."
      />

      {materials.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Niciun material disponibil încă"
          description="Materialele publicate de seminar vor apărea aici, gata de descărcare."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id} className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 py-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{material.title}</p>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {new Date(material.uploadedAt).toLocaleDateString("ro-RO")}
                  </p>
                </div>
                {material.description ? (
                  <p className="text-base text-muted-foreground">{material.description}</p>
                ) : null}
                <a
                  href={`/api/materiale/${material.id}`}
                  className="mt-auto inline-flex items-center gap-2 text-base text-primary underline"
                >
                  <Download className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate">{material.originalFileName}</span>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
