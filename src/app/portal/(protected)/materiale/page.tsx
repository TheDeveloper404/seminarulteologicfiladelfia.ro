import { desc } from "drizzle-orm";
import { db } from "@/db";
import { courseMaterials } from "@/db/schema";

export default async function StudentMaterialsPage() {
  const materials = await db
    .select()
    .from(courseMaterials)
    .orderBy(desc(courseMaterials.uploadedAt));

  return (
    <div>
      <h1 className="font-heading text-xl font-semibold">Materiale de curs</h1>

      {materials.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Niciun material disponibil încă.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
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
                Descarcă — {material.originalFileName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
