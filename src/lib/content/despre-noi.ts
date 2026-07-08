import type { ContentBlock } from "./types";

// TODO: text placeholder — se înlocuiește cu conținutul real furnizat de Seminar.
export const cineSuntem: ContentBlock = {
  heading: "Cine Suntem",
  slug: "despre-noi",
  summary:
    "TODO: prezentare generală a Seminarului Teologic Filadelfia — cine suntem și ce ne definește.",
  body: [
    "TODO: paragraf introductiv despre identitatea instituției.",
    "TODO: paragraf despre valorile și contextul eclesial în care activăm.",
  ],
};

export const conducerea: ContentBlock = {
  heading: "Conducerea",
  slug: "conducerea",
  summary: "TODO: structura de conducere a Seminarului.",
  body: ["TODO: prezentarea membrilor conducerii și rolurile acestora."],
};

export const organizarea: ContentBlock = {
  heading: "Organizarea",
  slug: "organizarea",
  summary: "TODO: modul de organizare instituțională a Seminarului.",
  body: ["TODO: detalii despre structura organizatorică."],
};

export const regulament: ContentBlock = {
  heading: "Regulament",
  slug: "regulament",
  summary: "TODO: regulamentul de organizare și funcționare.",
  body: ["TODO: text integral al regulamentului."],
};

export const misiune: ContentBlock = {
  heading: "Misiune",
  slug: "misiune",
  summary: "TODO: misiunea Seminarului Teologic Filadelfia.",
  body: ["TODO: declarația de misiune a instituției."],
};

export const crez: ContentBlock = {
  heading: "Crez",
  slug: "crez",
  summary: "TODO: crezul doctrinar al Seminarului.",
  body: ["TODO: articolele de credință."],
};

export const istoric: ContentBlock = {
  heading: "Istoric",
  slug: "istoric",
  summary: "TODO: istoricul înființării și dezvoltării Seminarului.",
  body: ["TODO: momentele cheie din istoria instituției."],
};

export const mesajDirector: ContentBlock = {
  heading: "Mesaj director",
  slug: "mesaj-director",
  summary: "TODO: mesajul directorului către comunitate.",
  body: ["TODO: textul mesajului directorului."],
};

export const despreNoiSections: ContentBlock[] = [
  conducerea,
  organizarea,
  regulament,
  misiune,
  crez,
  istoric,
  mesajDirector,
];
