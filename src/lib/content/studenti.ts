import type { ContentBlock } from "./types";

export const formatiiDeStudiu: ContentBlock = {
  heading: "Formații de studiu",
  slug: "formatii-de-studiu",
  summary: "Structura pe 2 ani a cursurilor Seminarului.",
  body: [
    "Cursurile Seminarului se întind pe durata a 2 ani și sunt organizate în module cuprinse în 2 semestre. Candidații admiși în anul curent formează anul I de studii, după care vor accede în anul II.",
    "Studenții admiși la următoarea sesiune de admitere se vor alătura studenților care au trecut din anul I în anul II, vor parcurge împreună cu aceștia anul II iar după ce promoția precedentă a absolvit, vor parcurge disciplinele cuprinse în modulele anului I de studiu.",
  ],
};

export const ziledeCurs: ContentBlock = {
  heading: "Zile de curs",
  slug: "zile-de-curs",
  summary: "Programul orelor de curs.",
  body: [
    "08:00 – 08:45: Examinare",
    "08:45 – 09:00: Pauză",
    "09:00 – 11:00: Sesiunea I de curs",
    "11:00 – 11:15: Pauză",
    "11:15 – 13:15: Sesiunea II de curs",
    "13:15 – 13:45: Pauza de masă",
    "13:45 – 15:45: Sesiunea III de curs",
  ],
};

export const evaluareStudenti: ContentBlock = {
  heading: "Evaluare",
  slug: "evaluare",
  summary: "Modul de evaluare a studenților: examene scrise și notare curentă.",
  body: [
    "Nivelul de pregătire a studenților va fi evaluat pe baza unor examene scrise, funcție de natura disciplinei de studiu și de strategia cadrului didactic respectiv.",
    "Examinarea se va face după parcurgerea materiei de studiu, la începutul proximului modul de curs, în așa fel încât să nu fie împiedicată desfășurarea procesului didactic.",
    "În afara examinărilor, studenții vor fi evaluați și pe baza contribuției aduse la buna desfășurare a procesului didactic, pe baza colaborării cu cadrele didactice și cu ceilalți studenți.",
    "Notele obținute de studenți în urma examinărilor vor fi de la 1 la 10, în cazul notării prin cifre, iar calificativele vor fi de la A la D, în cazul notării prin calificative.",
  ],
};

export const practicaEclesiala: ContentBlock = {
  heading: "Practică eclezială",
  slug: "practica-eclesiala",
  summary:
    "Practica eclezială și misionară a studenților, în colaborare cu bisericile locale.",
  body: [
    "Studenții Seminarului sunt datori să participe la efortul misionar al bisericii locale de care aparțin și potrivit cu chemarea, înzestrările și abilitățile pe care le au, să efectueze activitățile de practică eclesială și misionară.",
    "În acest sens se organizează colaborarea Seminarului cu bisericile locale de care aparțin studenții, în vederea obținerii permisiunii de a efectua practica eclesială și misionară, pentru a evalua în mod critic această activitate.",
    "Seminarul și biserica locală vor monitoriza în mod simultan activitatea fiecărui student.",
    "Fiecare student este dator ca la terminarea celor 2 ani de studiu să obțină 30 de credite, desfășurând activități de practică eclesială și misionară.",
  ],
};

export const vizitatori: ContentBlock = {
  heading: "Vizitatori",
  slug: "vizitatori",
  summary: "Condițiile de participare pentru cursanții vizitatori.",
  body: [
    "Deoarece printre obiectivele Seminarului se numără și promovarea educației teologice în bisericile evanghelice din România, Consiliul Director a decis ca persoanele interesate să poată participa la cursurile predate în cadrul Seminarului și să poată avea acces la manualele și materialele de studiu, cu următoarele condiții:",
    "1. Dacă doresc să asiste la cursuri și să primească materialele de studiu, vor achita contravaloarea cursurilor respective, dar nu mai mult de 20,00 lei.",
    "2. Dacă doresc doar să asiste la cursuri, fără a solicita materialele de studiu, acest lucru se va facilita în mod gratuit.",
  ],
};

export const studentiSections: ContentBlock[] = [
  formatiiDeStudiu,
  ziledeCurs,
  evaluareStudenti,
  practicaEclesiala,
  vizitatori,
];
