import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { conducerea } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: conducerea.heading };

export default function Page() {
  return <ContentPage block={conducerea} subNavItems={getSubNavItems("/despre-noi")} />;
}
