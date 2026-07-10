import type { ContentBlock } from "./types";

export const conditii: ContentBlock = {
  heading: "Condiții",
  slug: "conditii",
  summary: "Cerințele și actele necesare pentru înscrierea la interviul de admitere.",
  body: [
    "Înscrierea la cursurile Seminarului este precedată de un interviu cu caracter eliminator, la care candidatul trebuie să corespundă următoarelor cerințe:",
    "1. Să fie membru(ă) cu drepturi depline al unei Biserici evanghelice protestante (Biserică membră a Alianței Evanghelice);",
    "2. Să fie botezat(ă) de cel puțin 1 an;",
    "3. Să fie absolvent(ă) a cel puțin 10 clase;",
    "4. Să nu depășească vârsta de 65 de ani.",
    "În situații excepționale, Bordul Director poate aproba înscrierea unor candidați care nu împlinesc toate condițiile cerute pentru admiterea în rândul studenților Seminarului.",
    "Candidatul va prezenta la interviu un dosar care va cuprinde următoarele acte:",
    "1. Fișa tip de înscriere la admitere, eliberată de secretariatul Seminarului;",
    "2. Două fotografii color tip buletin;",
    "3. Xerocopia actului de identitate;",
    "4. Xerocopia ultimului act de studii;",
    "5. Xerocopiile actelor de studii teologice (în cazul în care există);",
    "6. Autobiografia și mărturia personală (care să nu fie mai mult de 1 pagină);",
    "7. Recomandarea tip din partea păstorului, formularul tip fiind eliberat de secretariatul Seminarului.",
    "Recomandarea este confidențială și după ce a fost scrisă, va fi introdusă într-un plic care va fi deschis de către comisia de examinare; candidatul nu are voie să citească recomandarea.",
    "Fișa tip de înscriere și recomandarea tip se pot obține de la secretariatul școlii sau se pot descărca, în format PDF, de pe site-ul Seminarului, secțiunea Admitere.",
  ],
};

export const evaluareAdmitere: ContentBlock = {
  heading: "Evaluare",
  slug: "evaluare",
  summary: "Modul de evaluare a candidaților la interviul de admitere.",
  body: [
    "Nivelul de cunoștințe biblice al candidaților se va evalua în cadrul interviului, de către comisia de examinare, pe baza răspunsurilor date la întrebări ce vizează cunoștințele biblice dobândite de candidat.",
    "Interviul are caracter eliminator.",
    "După introducerea examinării în scris a candidaților, evaluarea se va face pe baza punctajului obținut la proba scrisă și la proba orală, făcându-se media aritmetică a celor două note.",
    "Candidatul ale cărui cunoștințe biblice nu depășesc nivelul care corespunde notei 6 (șase) este descalificat.",
    "În cazul în care candidații care sunt examinați în scris încearcă în mod fraudulos să treacă proba eliminatorie, vor fi descalificați instantaneu.",
  ],
};

export const criteriiSelectie: ContentBlock = {
  heading: "Criterii selecție",
  slug: "criterii-selectie",
  summary: "Cele 3 criterii de selecție a candidaților și legitimația de student.",
  body: [
    "Candidații la admitere vor fi selecționați pe baza a 3 criterii, după cum urmează:",
    "1. Modul în care autobiografia și mărturia personală a candidatului reflectă nașterea sa din nou, dedicarea sa pentru viața creștină și chemarea sa la slujirea lui Dumnezeu;",
    "2. Nivelul cunoștințelor biblice acumulate de către candidat;",
    "3. Caracterizarea candidatului de către păstorul său.",
    "Studenții admiși în anul I de studii vor primi o legitimație de student, care va servi la legitimarea lor în cadrul activităților de practică eclesială și misionară, precum și la accesul la fondul de carte și de materiale de cercetare teologică al bibliotecii Seminarului.",
  ],
};

export const documente: ContentBlock = {
  heading: "Documente",
  slug: "documente",
  summary: "Documentele necesare (pdf)",
  body: [],
  downloads: [
    { label: "Fișa studentului", url: "/documente/fisa-studentului.pdf" },
    { label: "Recomandare pastorală", url: "/documente/recomandare-pastorala.pdf" },
  ],
};

export const admitereSections: ContentBlock[] = [
  conditii,
  evaluareAdmitere,
  criteriiSelectie,
  documente,
];
