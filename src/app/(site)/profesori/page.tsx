import type { Metadata } from "next";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { profesori } from "@/lib/content/profesori";
import type { StaffMember } from "@/lib/content/types";

export const metadata: Metadata = { title: "Profesori" };

function StaffCard({ prof, size = "default" }: { prof: StaffMember; size?: "default" | "large" }) {
  const photoSize = size === "large" ? "size-32" : "size-24";
  const photoPx = size === "large" ? 128 : 96;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      {prof.photoUrl ? (
        <Image
          src={prof.photoUrl}
          alt={prof.name}
          width={photoPx}
          height={photoPx}
          className={`${photoSize} rounded-full object-cover`}
        />
      ) : (
        <div className={`flex ${photoSize} items-center justify-center rounded-full bg-muted`}>
          <UserRound className="size-10 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <p className="mt-4 font-heading text-lg font-semibold text-foreground">{prof.name}</p>
      {prof.role && <p className="mt-1 text-sm text-muted-foreground">{prof.role}</p>}
      {prof.bio && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{prof.bio}</p>
      )}
    </div>
  );
}

export default function Page() {
  const tier1 = profesori.filter((p) => p.tier === 1);
  const tier2 = profesori.filter((p) => p.tier !== 1 && p.tier !== 3);
  const tier3 = profesori.filter((p) => p.tier === 3);

  return (
    <>
      <PageHeader
        title="Profesori"
        description="Corpul profesoral al Seminarului Teologic Filadelfia."
      />
      <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 lg:px-8">
        {tier1.length > 0 && (
          <div className="mx-auto mb-6 flex max-w-xs flex-col items-center gap-6">
            {tier1.map((prof) => (
              <StaffCard key={prof.name} prof={prof} size="large" />
            ))}
            <div aria-hidden="true" className="h-8 w-px bg-border" />
          </div>
        )}

        {tier2.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tier2.map((prof) => (
              <StaffCard key={prof.name} prof={prof} />
            ))}
          </div>
        )}

        {tier3.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
            {tier3.map((prof) => (
              <StaffCard key={prof.name} prof={prof} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
