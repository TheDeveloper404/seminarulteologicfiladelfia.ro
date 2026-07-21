import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Images } from "lucide-react";
import { db } from "@/db";
import { galleryAlbums, galleryPhotos } from "@/db/schema";
import { CreateAlbumForm } from "./create-album-form";
import { DeleteAlbumButton } from "./delete-album-button";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function GalleryPage() {
  const albums = await db
    .select({
      id: galleryAlbums.id,
      title: galleryAlbums.title,
      year: galleryAlbums.year,
      photoCount: sql<number>`count(${galleryPhotos.id})`.mapWith(Number),
    })
    .from(galleryAlbums)
    .leftJoin(galleryPhotos, eq(galleryPhotos.albumId, galleryAlbums.id))
    .groupBy(galleryAlbums.id)
    .orderBy(desc(galleryAlbums.year), galleryAlbums.title);

  return (
    <div>
      <PageHeader
        title="Galerie foto"
        description="Albume publice, vizibile pe pagina Arhiva foto a site-ului."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Creează album</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateAlbumForm />
          </CardContent>
        </Card>

        {albums.length === 0 ? (
          <EmptyState
            icon={Images}
            title="Niciun album încă"
            description="Creează primul album din stânga, apoi adaugă poze în el."
            className="mt-0 h-full"
          />
        ) : (
          <div className="h-fit overflow-x-auto rounded-lg border">
            <table className="w-full text-base">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-4 font-medium whitespace-nowrap">An</th>
                  <th className="w-full p-4 font-medium">Titlu</th>
                  <th className="p-4 font-medium whitespace-nowrap">Poze</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id} className="border-t">
                    <td className="p-4 whitespace-nowrap">{album.year}</td>
                    <td className="p-4">{album.title}</td>
                    <td className="p-4 whitespace-nowrap">{album.photoCount}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/admin/galerie/${album.id}`} />}
                          nativeButton={false}
                        >
                          Gestionează
                        </Button>
                        <DeleteAlbumButton albumId={album.id} albumTitle={album.title} />
                      </div>
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
