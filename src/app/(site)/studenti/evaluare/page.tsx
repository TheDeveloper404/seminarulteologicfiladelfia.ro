import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { evaluareStudenti } from "@/lib/content/studenti";

export const metadata: Metadata = { title: evaluareStudenti.heading };

export default function Page() {
  return <ContentPage block={evaluareStudenti} subNavItems={getSubNavItems("/studenti")} />;
}
