import Link from "next/link";

interface GalleryCardProps {
  slug: string;
  title: string;
  year: number;
  coverUrl: string | null;
  photoCount: number;
}

export function GalleryCard({ slug, title, year, coverUrl, photoCount }: GalleryCardProps) {
  return (
    <Link
      href={`/arhiva/${slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {coverUrl ? (
          // Poze admin-uploaded, servite direct de nginx din public/gallery/ — next/image nu
          // recunoaște fișiere adăugate după ultimul build.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-4">
        <p className="font-heading text-base font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {year} · {photoCount} {photoCount === 1 ? "poză" : "poze"}
        </p>
      </div>
    </Link>
  );
}
