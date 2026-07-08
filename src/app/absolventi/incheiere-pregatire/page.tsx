import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { incheiereaPregatire } from "@/lib/content/absolventi";

export const metadata: Metadata = { title: incheiereaPregatire.heading };

export default function Page() {
  return <ContentPage block={incheiereaPregatire} subNavItems={getSubNavItems("/absolventi")} />;
}
