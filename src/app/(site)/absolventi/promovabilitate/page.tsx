import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { promovabilitate } from "@/lib/content/absolventi";

export const metadata: Metadata = { title: promovabilitate.heading };

export default function Page() {
  return <ContentPage block={promovabilitate} subNavItems={getSubNavItems("/absolventi")} />;
}
