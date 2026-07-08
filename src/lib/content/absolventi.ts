import type { ContentBlock } from "./types";

// TODO: text placeholder — se înlocuiește cu conținutul real furnizat de Seminar.
export const absolventiIntro: ContentBlock = {
  heading: "Absolvenți",
  slug: "absolventi",
  summary: "TODO: prezentare generală despre absolvenți.",
  body: ["TODO: paragraf introductiv despre parcursul absolvenților."],
};

export const promovabilitate: ContentBlock = {
  heading: "Promovabilitate",
  slug: "promovabilitate",
  summary: "TODO: date despre promovabilitate.",
  body: ["TODO: detalii/statistici despre promovabilitate."],
};

export const incheiereaPregatire: ContentBlock = {
  heading: "Încheiere pregătire",
  slug: "incheiere-pregatire",
  summary: "TODO: procesul de încheiere a pregătirii.",
  body: ["TODO: detalii despre încheierea pregătirii."],
};

export const absolventiSections: ContentBlock[] = [
  promovabilitate,
  incheiereaPregatire,
];
