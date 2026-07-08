import Link from "next/link";
import Image from "next/image";
import type { GalleryAlbum } from "@/lib/content/types";

interface GalleryCardProps {
  album: GalleryAlbum;
}

export function GalleryCard({ album }: GalleryCardProps) {
  return (
    <Link
      href={`/arhiva/${album.slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={album.coverImageUrl}
          alt={album.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="font-heading text-base font-semibold text-foreground">
          {album.title}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{album.date}</p>
      </div>
    </Link>
  );
}
