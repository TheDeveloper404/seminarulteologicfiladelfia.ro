import type { MetadataRoute } from "next";

const BASE_URL = "https://seminarulteologicfiladelfia.ro";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Portal admin/student — protejate prin sesiune (redirect la login fără date scurse),
      // dar tot nu au ce căuta indexate: previne apariția în rezultate de căutare a structurii
      // interne (/admin/studenti, /portal/note etc.).
      disallow: ["/admin", "/portal"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
