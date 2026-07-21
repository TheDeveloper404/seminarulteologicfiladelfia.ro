import { desc } from "drizzle-orm";
import { FileText } from "lucide-react";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";
import { UploadForm } from "./upload-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";

export default async function CourseMaterialsPage() {
  const materials = await db
    .select()
    .from(courseMaterials)
    .orderBy(desc(courseMaterials.uploadedAt));

  return (
    <div>
      <PageHeader title="Materiale de curs" />

      <div className="mt-6 max-w-lg">
        <UploadForm />
      </div>

      {materials.length === 0 ? (
        <div className="max-w-lg">
          <EmptyState
            icon={FileText}
            title="Niciun material încărcat încă"
            description="Materialele adăugate aici devin disponibile pentru descărcare în portalul studenților."
          />
        </div>
      ) : (
        <ul className="mt-6 flex max-w-lg flex-col gap-2">
          {materials.map((material) => (
            <li key={material.id} className="rounded-lg border p-3">
              <p className="font-medium">{material.title}</p>
              {material.description && (
                <p className="text-sm text-muted-foreground">{material.description}</p>
              )}
              <a
                href={`/api/materiale/${material.id}`}
                className="mt-1 inline-block text-sm text-primary underline"
              >
                {material.originalFileName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
