import { Compass, History, Users } from "lucide-react";
import { Hero } from "@/components/sections/hero";
import { ContentSection } from "@/components/sections/content-section";
import { cineSuntem, istoric, misiune } from "@/lib/content/despre-noi";

const homeSections = [
  { block: cineSuntem, href: "/despre-noi", icon: Users },
  { block: misiune, href: "/despre-noi/misiune", icon: Compass },
  { block: istoric, href: "/despre-noi/istoric", icon: History },
];

export default function HomePage() {
  return (
    <>
      <Hero
        title="Seminarul Teologic Filadelfia"
        subtitle="O școală teologică evanghelică protestantă conservatoare, o comunitate academică ce ființează în context eclesial."
        ctaLabel="Admitere"
        ctaHref="/admitere/conditii"
        secondaryCtaLabel="Contact"
        secondaryCtaHref="/contact"
      />
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Despre Seminar
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Descoperă cine suntem
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeSections.map(({ block, href, icon }) => (
              <ContentSection
                key={block.slug}
                heading={block.heading}
                summary={block.summary}
                href={href}
                icon={icon}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
