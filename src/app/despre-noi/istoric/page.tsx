import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { istoric } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: istoric.heading };

export default function Page() {
  return <ContentPage block={istoric} subNavItems={getSubNavItems("/despre-noi")} />;
}
