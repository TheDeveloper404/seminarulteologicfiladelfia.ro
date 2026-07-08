import type { ContentBlock } from "./types";

// TODO: text placeholder — se înlocuiește cu conținutul real furnizat de Seminar.
export const admitereIntro: ContentBlock = {
  heading: "Admitere",
  slug: "admitere",
  summary: "TODO: prezentare generală a procesului de admitere.",
  body: ["TODO: paragraf introductiv despre admitere."],
};

export const conditii: ContentBlock = {
  heading: "Condiții",
  slug: "conditii",
  summary: "TODO: condițiile de admitere.",
  body: ["TODO: detalii despre condițiile necesare."],
};

export const evaluareAdmitere: ContentBlock = {
  heading: "Evaluare",
  slug: "evaluare",
  summary: "TODO: modul de evaluare a candidaților.",
  body: ["TODO: detalii despre procesul de evaluare la admitere."],
};

export const criteriiSelectie: ContentBlock = {
  heading: "Criterii selecție",
  slug: "criterii-selectie",
  summary: "TODO: criteriile de selecție a candidaților.",
  body: ["TODO: detalii despre criteriile de selecție."],
};

export const documente: ContentBlock = {
  heading: "Documente",
  slug: "documente",
  summary: "TODO: documentele necesare pentru admitere.",
  body: ["TODO: lista documentelor necesare."],
};

export const admitereSections: ContentBlock[] = [
  conditii,
  evaluareAdmitere,
  criteriiSelectie,
  documente,
];
