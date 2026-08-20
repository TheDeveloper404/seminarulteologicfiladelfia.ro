// Separat de import.ts (care importă exceljs) — import-form.tsx e "use client" și doar are
// nevoie de această listă pentru UI. Dacă ar importa-o din import.ts, exceljs (~1MB minificat)
// ar ajunge în bundle-ul de client, deși e folosit doar server-side (verificat empiric: exact
// asta s-a întâmplat până la separarea în acest fișier).
export const REGISTRY_COLUMNS = [
  "Nume",
  "Dată naștere (ZZ.LL.AAAA)",
  "Localitate",
  "Județ",
  "Adresă",
  "Biserică",
  "Telefon",
] as const;
