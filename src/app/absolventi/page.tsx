import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { absolventiIntro } from "@/lib/content/absolventi";

export const metadata: Metadata = { title: absolventiIntro.heading };

export default function Page() {
  return <ContentPage block={absolventiIntro} subNavItems={getSubNavItems("/absolventi")} />;
}
