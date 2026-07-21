import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { criteriiSelectie } from "@/lib/content/admitere";

export const metadata: Metadata = { title: criteriiSelectie.heading };

export default function Page() {
  return <ContentPage block={criteriiSelectie} subNavItems={getSubNavItems("/admitere")} />;
}
