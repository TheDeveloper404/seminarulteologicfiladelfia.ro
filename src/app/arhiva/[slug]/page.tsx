import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/page-header";
import { Lightbox } from "@/components/gallery/lightbox";
import { galerii } from "@/lib/content/galerii";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return galerii.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = galerii.find((a) => a.slug === slug);
  return { title: album ? album.title : "Galerie" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const album = galerii.find((a) => a.slug === slug);

  if (!album) {
    notFound();
  }

  return (
    <>
      <PageHeader title={album.title} description={album.date} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Lightbox items={album.items} albumTitle={album.title} />
      </div>
    </>
  );
}
