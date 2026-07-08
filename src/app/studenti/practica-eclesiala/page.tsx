import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { practicaEclesiala } from "@/lib/content/studenti";

export const metadata: Metadata = { title: practicaEclesiala.heading };

export default function Page() {
  return <ContentPage block={practicaEclesiala} subNavItems={getSubNavItems("/studenti")} />;
}
