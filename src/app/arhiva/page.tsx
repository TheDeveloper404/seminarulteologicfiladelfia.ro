import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { galerii } from "@/lib/content/galerii";

export const metadata: Metadata = { title: "Arhiva foto/video" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Arhiva foto/video"
        description="Galerii foto și video din viața Seminarului."
      />
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-8">
        <GalleryGrid albums={galerii} />
      </div>
    </>
  );
}
