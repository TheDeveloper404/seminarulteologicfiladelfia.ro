import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { mesajDirector } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: mesajDirector.heading };

export default function Page() {
  return <ContentPage block={mesajDirector} subNavItems={getSubNavItems("/despre-noi")} />;
}
