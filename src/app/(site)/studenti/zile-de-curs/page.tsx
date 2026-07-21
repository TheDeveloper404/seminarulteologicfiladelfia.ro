import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { ziledeCurs } from "@/lib/content/studenti";

export const metadata: Metadata = { title: ziledeCurs.heading };

export default function Page() {
  return <ContentPage block={ziledeCurs} subNavItems={getSubNavItems("/studenti")} />;
}
