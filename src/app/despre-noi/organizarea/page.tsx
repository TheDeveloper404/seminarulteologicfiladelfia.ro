import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { organizarea } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: organizarea.heading };

export default function Page() {
  return <ContentPage block={organizarea} subNavItems={getSubNavItems("/despre-noi")} />;
}
