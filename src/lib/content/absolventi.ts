import type { ContentBlock } from "./types";

export const promovabilitate: ContentBlock = {
  heading: "Promovabilitate",
  slug: "promovabilitate",
  summary: "Condițiile de promovare a studenților pe parcursul celor 2 ani de studiu.",
  body: [
    "Studenții care parcurg cei 2 ani de studiu vor putea fi promovați doar dacă notele obținute de ei nu vor fi sub 5, respectiv D.",
    "În cazul unor examene nepromovate sau la care studentul nu s-a prezentat din motive obiective, studenții vor fi declarați restanți la disciplinele respective și se va proceda la reexaminarea lor.",
    "În catalogul în care se ține evidența rezultatelor obținute, va fi consemnată și nota de la examenul nepromovat cât și nota de la examenul de restanță.",
    "În cazul înregistrării a 3 restanțe succesive în cadrul aceluiași an de studiu, studentul în cauză își pierde din oficiu calitatea de student dar are dreptul ca la următoarea sesiune de admitere să se reînscrie pentru repetarea anului respectiv.",
    "Notele obținute în anul precedent de către studentul reînscris vor putea fi echivalate doar dacă studentul are acordul cadrului didactic respectiv și cererea sa este aprobată de Bordul Director al Seminarului.",
    "La începerea anului II studenții care au promovat toate examenele din anul precedent vor fi promovați din oficiu în anul următor de studii, prezentând totodată adeverințele de practică misionară ce atestă desfășurarea practicii eclesiale și misionare pe durata vacanței de vară.",
  ],
};

export const incheiereaPregatire: ContentBlock = {
  heading: "Încheiere pregătire",
  slug: "incheiere-pregatire",
  summary: "Certificatul de absolvire acordat la finalul celor 2 ani de studiu.",
  body: [
    "La încheierea celor 2 ani de studiu, studenții care au promovat toate examenele, vor primi un Certificat de absolvire, care va conține numele complet al absolventului, anul promovării, semnătura directorului Seminarului cât și semnătura președintelui Comunității Regionale Arad, în raza căreia se află Seminarul Teologic Penticostal Filadelfia din Petroșani.",
  ],
};

export const absolventiSections: ContentBlock[] = [
  promovabilitate,
  incheiereaPregatire,
];
