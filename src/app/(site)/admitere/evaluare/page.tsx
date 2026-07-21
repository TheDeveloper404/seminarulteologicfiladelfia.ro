import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { evaluareAdmitere } from "@/lib/content/admitere";

export const metadata: Metadata = { title: evaluareAdmitere.heading };

export default function Page() {
  return <ContentPage block={evaluareAdmitere} subNavItems={getSubNavItems("/admitere")} />;
}
