import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { documente } from "@/lib/content/admitere";

export const metadata: Metadata = { title: documente.heading };

export default function Page() {
  return <ContentPage block={documente} subNavItems={getSubNavItems("/admitere")} />;
}
