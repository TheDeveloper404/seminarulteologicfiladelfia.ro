import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { vizitatori } from "@/lib/content/studenti";

export const metadata: Metadata = { title: vizitatori.heading };

export default function Page() {
  return <ContentPage block={vizitatori} subNavItems={getSubNavItems("/studenti")} />;
}
