import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { conditii } from "@/lib/content/admitere";

export const metadata: Metadata = { title: conditii.heading };

export default function Page() {
  return <ContentPage block={conditii} subNavItems={getSubNavItems("/admitere")} />;
}
