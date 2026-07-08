import { Hero } from "@/components/sections/hero";
import { ContentSection } from "@/components/sections/content-section";
import { cineSuntem, istoric, misiune } from "@/lib/content/despre-noi";

const homeSections = [
  { block: cineSuntem, href: "/despre-noi" },
  { block: misiune, href: "/despre-noi/misiune" },
  { block: istoric, href: "/despre-noi/istoric" },
];

export default function HomePage() {
  return (
    <>
      <Hero
        title="Seminarul Teologic Filadelfia"
        subtitle="O școală teologică evanghelică protestantă conservatoare, o comunitate academică ce ființează în context eclesial."
        ctaLabel="Admitere"
        ctaHref="/admitere"
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeSections.map(({ block, href }) => (
            <ContentSection
              key={block.slug}
              heading={block.heading}
              summary={block.summary}
              href={href}
            />
          ))}
        </div>
      </section>
    </>
  );
}
