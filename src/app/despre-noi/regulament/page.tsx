import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { regulament } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: regulament.heading };

export default function Page() {
  return <ContentPage block={regulament} subNavItems={getSubNavItems("/despre-noi")} />;
}
