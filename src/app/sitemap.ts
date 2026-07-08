import type { MetadataRoute } from "next";
import { mainNav } from "@/lib/content/site-config";

const BASE_URL = "https://seminarulteologicfiladelfia.ro";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: string[] = [];

  for (const item of mainNav) {
    routes.push(item.href);
    if (item.children) {
      for (const child of item.children) {
        routes.push(child.href);
      }
    }
  }

  return Array.from(new Set(routes)).map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));
}
