import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { galleryAlbums, galleryPhotos } from "@/db/schema";
import { galleryPhotoUrl } from "@/lib/gallery/storage";
import { PageHeader } from "@/components/sections/page-header";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Arhiva foto" };

export default async function Page() {
  const albums = await db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      title: galleryAlbums.title,
      year: galleryAlbums.year,
      photoCount: sql<number>`count(${galleryPhotos.id})`.mapWith(Number),
      coverFileName: sql<string | null>`min(${galleryPhotos.fileName})`,
    })
    .from(galleryAlbums)
    .leftJoin(galleryPhotos, eq(galleryPhotos.albumId, galleryAlbums.id))
    .groupBy(galleryAlbums.id)
    .orderBy(desc(galleryAlbums.year), galleryAlbums.title);

  const albumSummaries = albums.map((album) => ({
    slug: album.slug,
    title: album.title,
    year: album.year,
    photoCount: album.photoCount,
    coverUrl: album.coverFileName ? galleryPhotoUrl(album.year, album.coverFileName) : null,
  }));

  return (
    <>
      <PageHeader title="Arhiva foto" description="Galerii foto din viața Seminarului." />
      <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 lg:px-8">
        <GalleryGrid albums={albumSummaries} />
      </div>
    </>
  );
}
