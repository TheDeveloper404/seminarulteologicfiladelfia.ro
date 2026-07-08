import type { Metadata } from "next";
import { ContentPage } from "@/components/sections/content-page";
import { programaEducationala } from "@/lib/content/programa";

export const metadata: Metadata = { title: programaEducationala.heading };

export default function Page() {
  return <ContentPage block={programaEducationala} />;
}
