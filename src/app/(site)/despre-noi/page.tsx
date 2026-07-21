import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { cineSuntem } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: cineSuntem.heading };

export default function Page() {
  return <ContentPage block={cineSuntem} subNavItems={getSubNavItems("/despre-noi")} />;
}
