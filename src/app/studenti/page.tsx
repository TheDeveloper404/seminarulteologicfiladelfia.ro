import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { studentiIntro } from "@/lib/content/studenti";

export const metadata: Metadata = { title: studentiIntro.heading };

export default function Page() {
  return <ContentPage block={studentiIntro} subNavItems={getSubNavItems("/studenti")} />;
}
