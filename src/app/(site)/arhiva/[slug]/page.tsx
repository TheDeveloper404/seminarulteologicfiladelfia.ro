import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryAlbums, galleryPhotos } from "@/db/schema";
import { galleryPhotoUrl } from "@/lib/gallery/storage";
import { PageHeader } from "@/components/sections/page-header";
import { Lightbox } from "@/components/gallery/lightbox";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [album] = await db
    .select({ title: galleryAlbums.title })
    .from(galleryAlbums)
    .where(eq(galleryAlbums.slug, slug))
    .limit(1);
  return { title: album ? album.title : "Galerie" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const [album] = await db
    .select()
    .from(galleryAlbums)
    .where(eq(galleryAlbums.slug, slug))
    .limit(1);

  if (!album) {
    notFound();
  }

  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.albumId, album.id))
    .orderBy(desc(galleryPhotos.createdAt));

  const items = photos.map((photo) => ({
    id: photo.id,
    url: galleryPhotoUrl(album.year, photo.fileName),
  }));

  return (
    <>
      <PageHeader title={album.title} description={String(album.year)} />
      <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 lg:px-8">
        <Lightbox items={items} albumTitle={album.title} />
      </div>
    </>
  );
}
