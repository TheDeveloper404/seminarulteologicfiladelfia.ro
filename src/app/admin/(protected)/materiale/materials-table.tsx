"use client";

import { useMemo, useState } from "react";
import { SortableHeader } from "@/components/app-shell/sortable-header";
import { DeleteMaterialButton } from "./delete-material-button";
import { EditMaterialDialog } from "./edit-material-dialog";
import { PublishToggleButton } from "./publish-toggle-button";
import type { courseMaterials } from "@/db/schema";

type Material = typeof courseMaterials.$inferSelect;

type SortField = "title" | "originalFileName";

export function MaterialsTable({ materials }: { materials: Material[] }) {
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const sorted = useMemo(() => {
    return [...materials].sort((a, b) => {
      const comparison = a[sortField].localeCompare(b[sortField], "ro");
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [materials, sortField, sortDirection]);

  return (
    <div className="h-fit overflow-x-auto rounded-lg border">
      <table className="w-full text-base">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="w-48 p-4 font-medium">
              <SortableHeader
                label="Titlu"
                field="title"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="w-full p-4 font-medium">Descriere</th>
            <th className="p-4 font-medium whitespace-nowrap">
              <SortableHeader
                label="Fișier"
                field="originalFileName"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="p-4 font-medium whitespace-nowrap">Încărcat la</th>
            <th className="p-4" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((material) => (
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
