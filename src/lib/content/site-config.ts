import type { NavItem } from "./types";

export const siteConfig = {
  name: "Seminarul Teologic Filadelfia",
  contact: {
    phones: ["0721.255.379", "0737.420.002"],
    email: "seminar.filadelfia@gmail.com",
  },
  parentChurch: {
    name: "Biserica Filadelfia Petroșani",
    url: "https://filadelfia-petrosani.ro",
  },
};

export const mainNav: NavItem[] = [
  { label: "Acasă", href: "/" },
  {
    label: "Despre Noi",
    href: "/despre-noi",
    children: [
      { label: "Cine Suntem", href: "/despre-noi" },
      { label: "Conducerea", href: "/despre-noi/conducerea" },
      { label: "Organizarea", href: "/despre-noi/organizarea" },
      { label: "Regulament", href: "/despre-noi/regulament" },
      { label: "Misiune", href: "/despre-noi/misiune" },
      { label: "Crez", href: "/despre-noi/crez" },
      { label: "Istoric", href: "/despre-noi/istoric" },
      { label: "Mesaj director", href: "/despre-noi/mesaj-director" },
    ],
  },
  { label: "Profesori", href: "/profesori" },
  {
    label: "Studenți",
    href: "/studenti",
    linkable: false,
    children: [
      { label: "Formații de studiu", href: "/studenti/formatii-de-studiu" },
      { label: "Zile de curs", href: "/studenti/zile-de-curs" },
      { label: "Evaluare", href: "/studenti/evaluare" },
      { label: "Practică eclezială", href: "/studenti/practica-eclesiala" },
      { label: "Vizitatori", href: "/studenti/vizitatori" },
    ],
  },
  {
    label: "Admitere",
    href: "/admitere",
    linkable: false,
    children: [
      { label: "Condiții", href: "/admitere/conditii" },
      { label: "Evaluare", href: "/admitere/evaluare" },
      { label: "Criterii selecție", href: "/admitere/criterii-selectie" },
      { label: "Documente", href: "/admitere/documente" },
    ],
  },
  { label: "Programa educațională", href: "/programa-educationala" },
  {
    label: "Absolvenți",
    href: "/absolventi",
    linkable: false,
    children: [
      { label: "Promovabilitate", href: "/absolventi/promovabilitate" },
      { label: "Încheiere pregătire", href: "/absolventi/incheiere-pregatire" },
    ],
  },
  { label: "Arhiva foto", href: "/arhiva" },
  { label: "Contact", href: "/contact" },
];

export function getSubNavItems(parentHref: string) {
  return mainNav.find((item) => item.href === parentHref)?.children;
}
