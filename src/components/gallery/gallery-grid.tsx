import { GalleryCard } from "@/components/gallery/gallery-card";
import type { GalleryAlbum } from "@/lib/content/types";

interface GalleryGridProps {
  albums: GalleryAlbum[];
}

export function GalleryGrid({ albums }: GalleryGridProps) {
  if (albums.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="font-heading text-lg font-semibold text-foreground">
          Nu există încă galerii publicate
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Arhiva foto/video va fi completată în perioada următoare.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => (
        <GalleryCard key={album.slug} album={album} />
      ))}
    </div>
  );
}
