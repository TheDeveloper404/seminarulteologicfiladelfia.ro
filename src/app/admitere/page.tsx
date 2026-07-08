import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { admitereIntro } from "@/lib/content/admitere";

export const metadata: Metadata = { title: admitereIntro.heading };

export default function Page() {
  return <ContentPage block={admitereIntro} subNavItems={getSubNavItems("/admitere")} />;
}
