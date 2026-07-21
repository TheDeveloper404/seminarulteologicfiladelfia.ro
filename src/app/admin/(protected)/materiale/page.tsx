import { desc } from "drizzle-orm";
import { FileText } from "lucide-react";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";
import { UploadForm } from "./upload-form";
import { DeleteMaterialButton } from "./delete-material-button";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function CourseMaterialsPage() {
  const materials = await db
    .select()
    .from(courseMaterials)
    .orderBy(desc(courseMaterials.uploadedAt));

  return (
    <div>
      <PageHeader
        title="Materiale de curs"
        description="Materialele adăugate aici devin disponibile pentru descărcare în portalul studenților."
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
                    <td className="p-4 text-muted-foreground">
                      {material.description || "—"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <a
                        href={`/api/materiale/${material.id}`}
                        className="text-primary underline"
                      >
                        {material.originalFileName}
                      </a>
                    </td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground">
                      {new Date(material.uploadedAt).toLocaleDateString("ro-RO")}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <DeleteMaterialButton
                        materialId={material.id}
                        materialTitle={material.title}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
