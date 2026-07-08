import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import { profesori } from "@/lib/content/profesori";

export const metadata: Metadata = { title: "Profesori" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Profesori"
        description="Corpul profesoral al Seminarului Teologic Filadelfia."
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profesori.map((prof) => (
            <div
              key={prof.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="font-heading text-lg font-semibold text-foreground">
                {prof.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{prof.role}</p>
              {prof.bio && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {prof.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
