import type { StaffMember } from "./types";

// TODO: disciplina predată pentru cei fără `role` — lipsă, doar numele + poza (unde există) au
// fost furnizate până acum. Completează când vine lista de la Seminar.
export const profesori: StaffMember[] = [
  {
    name: "Prof. Daniel Nemeș",
    role: "Directorul Seminarului",
    photoUrl: "/images/profesori/nemes-daniel.png",
    tier: 1,
  },
  {
    // TODO: poză — așteaptă de la Seminar. Deja secretar, fără prefix "Prof.".
    name: "Daniel Bulancea",
    role: "Secretarul Seminarului",
    tier: 2,
  },
  {
    // TODO: poză — așteaptă de la Seminar.
    name: "Larisa Bulancea",
    role: "Caseriță",
    tier: 2,
  },
  {
    name: "Prof. Claudiu Valeriu Todeciu",
    photoUrl: "/images/profesori/todeciu-claudiu-valer.png",
    tier: 2,
  },
  {
    name: "Prof. Ionel Grecu",
    role: "Pastor Biserica Filadelfia Horezu",
    photoUrl: "/images/profesori/ionel-grecu.jpg",
    tier: 3,
  },
  {
    name: "Prof. Sorin Donțu",
    photoUrl: "/images/profesori/dontu-sorin.png",
    tier: 3,
  },
  {
    name: "Prof. Daniel Bălăceanu",
    photoUrl: "/images/profesori/balaceanu-daniel.png",
    tier: 3,
  },
];
