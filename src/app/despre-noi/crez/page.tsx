import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { crez } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: crez.heading };

export default function Page() {
  return <ContentPage block={crez} subNavItems={getSubNavItems("/despre-noi")} />;
}
