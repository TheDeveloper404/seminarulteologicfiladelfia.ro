import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ImageOff } from "lucide-react";
import { db } from "@/db";
import { galleryAlbums, galleryPhotos } from "@/db/schema";
import { galleryPhotoUrl } from "@/lib/gallery/storage";
import { UploadPhotosForm } from "./upload-photos-form";
import { DeletePhotoButton } from "./delete-photo-button";
import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/app-shell/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const albumId = Number(id);
  if (!Number.isInteger(albumId)) notFound();

  const [album] = await db
    .select()
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, albumId))
    .limit(1);
  if (!album) notFound();

  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.albumId, albumId))
    .orderBy(desc(galleryPhotos.createdAt));

  return (
    <div>
      <PageHeader title={album.title} description={`An ${album.year}`} />

      <Card className="mt-6 max-w-xl">
        <CardHeader>
          <CardTitle>Adaugă poze</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadPhotosForm albumId={album.id} />
        </CardContent>
      </Card>

      {photos.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title="Nicio poză încă"
          description="Alege poze mai sus ca să le adaugi în acest album."
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- vezi nota din gallery-card.tsx */}
              <img
                src={galleryPhotoUrl(album.year, photo.fileName)}
                alt=""
                className="size-full object-cover"
              />
              <DeletePhotoButton photoId={photo.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
