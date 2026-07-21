import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { getSubNavItems } from "@/lib/content/site-config";
import { misiune } from "@/lib/content/despre-noi";

export const metadata: Metadata = { title: misiune.heading };

export default function Page() {
  return <ContentPage block={misiune} subNavItems={getSubNavItems("/despre-noi")} />;
}
