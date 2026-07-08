import type { ContentBlock } from "./types";

// TODO: text placeholder — se înlocuiește cu conținutul real furnizat de Seminar.
export const studentiIntro: ContentBlock = {
  heading: "Studenți",
  slug: "studenti",
  summary: "TODO: prezentare generală pentru secțiunea Studenți.",
  body: ["TODO: paragraf introductiv despre viața de student la Seminar."],
};

export const formatiiDeStudiu: ContentBlock = {
  heading: "Formații de studiu",
  slug: "formatii-de-studiu",
  summary: "TODO: formațiile de studiu disponibile.",
  body: ["TODO: detalii despre formațiile de studiu."],
};

export const ziledeCurs: ContentBlock = {
  heading: "Zile de curs",
  slug: "zile-de-curs",
  summary: "TODO: programul zilelor de curs.",
  body: ["TODO: detalii despre orarul cursurilor."],
};

export const evaluareStudenti: ContentBlock = {
  heading: "Evaluare",
  slug: "evaluare",
  summary: "TODO: modul de evaluare a studenților.",
  body: ["TODO: detalii despre criteriile și metodele de evaluare."],
};

export const practicaEclesiala: ContentBlock = {
  heading: "Practică eclezială",
  slug: "practica-eclesiala",
  summary: "TODO: practica eclezială a studenților.",
  body: ["TODO: detalii despre practica eclezială."],
};

export const vizitatori: ContentBlock = {
  heading: "Vizitatori",
  slug: "vizitatori",
  summary: "TODO: informații pentru vizitatori.",
  body: ["TODO: detalii pentru vizitatori."],
};

export const studentiSections: ContentBlock[] = [
  formatiiDeStudiu,
  ziledeCurs,
  evaluareStudenti,
  practicaEclesiala,
  vizitatori,
];
