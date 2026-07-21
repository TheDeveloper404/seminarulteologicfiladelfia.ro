import { desc } from "drizzle-orm";
import { FileText } from "lucide-react";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";

export default async function StudentMaterialsPage() {
  const materials = await db
    .select()
    .from(courseMaterials)
    .orderBy(desc(courseMaterials.uploadedAt));

  return (
    <div>
      <PageHeader title="Materiale de curs" />

      {materials.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Niciun material disponibil încă"
          description="Materialele încărcate de admin vor apărea aici, gata de descărcare."
        />
      ) : (
        <ul className="mt-6 flex max-w-2xl flex-col gap-3">
          {materials.map((material) => (
            <li key={material.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-medium">{material.title}</p>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {new Date(material.uploadedAt).toLocaleDateString("ro-RO")}
                </p>
              </div>
              {material.description && (
                <p className="text-base text-muted-foreground">{material.description}</p>
              )}
              <a
                href={`/api/materiale/${material.id}`}
                className="mt-1 inline-block text-base text-primary underline"
              >
                Descarcă — {material.originalFileName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
