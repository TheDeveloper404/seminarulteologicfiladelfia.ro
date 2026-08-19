import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { EyeOff, FileText } from "lucide-react";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";
import { UploadForm } from "./upload-form";
import { DeleteMaterialButton } from "./delete-material-button";
import { EditMaterialDialog } from "./edit-material-dialog";
import { PublishToggleButton } from "./publish-toggle-button";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Materiale de curs",
  robots: { index: false, follow: false },
};

type Material = typeof courseMaterials.$inferSelect;

function MaterialsTable({ materials }: { materials: Material[] }) {
  return (
    <div className="h-fit overflow-x-auto rounded-lg border">
      <table className="w-full text-base">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="w-48 p-4 font-medium">Titlu</th>
            <th className="w-full p-4 font-medium">Descriere</th>
            <th className="p-4 font-medium whitespace-nowrap">Fișier</th>
            <th className="p-4 font-medium whitespace-nowrap">Încărcat la</th>
            <th className="p-4" />
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material.id} className="border-t">
              <td className="p-4 font-medium">{material.title}</td>
              <td className="p-4 text-muted-foreground">{material.description || "—"}</td>
              <td className="p-4 whitespace-nowrap">
                <a href={`/api/materiale/${material.id}`} className="text-primary underline">
                  {material.originalFileName}
                </a>
              </td>
              <td className="p-4 whitespace-nowrap text-muted-foreground">
                {new Date(material.uploadedAt).toLocaleDateString("ro-RO")}
              </td>
              <td className="p-4 text-right whitespace-nowrap">
                <div className="flex justify-end gap-2">
                  <PublishToggleButton
                    materialId={material.id}
                    published={material.published}
                  />
                  <EditMaterialDialog
                    materialId={material.id}
                    title={material.title}
                    description={material.description}
                  />
                  <DeleteMaterialButton
                    materialId={material.id}
                    materialTitle={material.title}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CourseMaterialsPage() {
  const materials = await db
    .select()
    .from(courseMaterials)
    .orderBy(desc(courseMaterials.uploadedAt));

  const drafts = materials.filter((material) => !material.published);
  const published = materials.filter((material) => material.published);

  return (
    <div>
      <PageHeader
        title="Materiale de curs"
        description="Materialele încărcate rămân ascunse studenților până le publici tu, cu butonul „Publică”."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Adaugă material</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>

        {materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Niciun material încărcat încă"
            description="Alege un fișier din stânga ca să-l adaugi."
            className="mt-0 h-full"
          />
        ) : (
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-lg font-medium">
                Pregătite — nevizibile studenților{" "}
                <span className="text-muted-foreground">({drafts.length})</span>
              </h2>
              <p className="mt-1 text-base text-muted-foreground">
                Le încarci din timp; studenții nu le văd până apeși „Publică”.
              </p>
              {drafts.length === 0 ? (
                <EmptyState
                  icon={EyeOff}
                  title="Nimic în așteptare"
                  description="Toate materialele încărcate sunt deja publicate."
                  className="mt-4"
                />
              ) : (
                <div className="mt-4">
                  <MaterialsTable materials={drafts} />
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-medium">
                Vizibile studenților{" "}
                <span className="text-muted-foreground">({published.length})</span>
              </h2>
              <p className="mt-1 text-base text-muted-foreground">
                Apar în portalul studenților, gata de descărcat. „Ascunde” le retrage imediat.
              </p>
              {published.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Niciun material publicat"
                  description="Publică un material de mai sus ca să apară în portalul studenților."
                  className="mt-4"
                />
              ) : (
                <div className="mt-4">
                  <MaterialsTable materials={published} />
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
