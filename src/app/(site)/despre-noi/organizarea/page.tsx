import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { OrgChart } from "@/components/sections/org-chart";
import { getSubNavItems } from "@/lib/content/site-config";
import { organizarea } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: organizarea.heading };

export default function Page() {
  return (
    <>
      <ContentPage block={organizarea} subNavItems={getSubNavItems("/despre-noi")} />
      <div className="mx-auto max-w-6xl px-4 pb-16 text-center sm:px-6 lg:px-8">
        <h2 className="mb-2 font-heading text-lg font-semibold uppercase tracking-wide text-foreground">
          Organigrama
        </h2>
        <OrgChart />
      </div>
    </>
  );
}
