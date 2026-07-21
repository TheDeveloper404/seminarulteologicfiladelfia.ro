export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  /** false pentru grupuri fără pagină proprie — eticheta deschide doar dropdown-ul, nu navighează. */
  linkable?: boolean;
}

export interface DownloadableFile {
  label: string;
  url: string;
}

export interface CurriculumRow {
  anul1: string;
  anul2: string;
}

export interface ContentBlock {
  heading: string;
  slug: string;
  summary: string;
  body: string[];
  image?: {
    url: string;
    alt: string;
  };
  downloads?: DownloadableFile[];
  curriculum?: CurriculumRow[];
}

export interface StaffMember {
  name: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
  // Nivel ierarhic pentru afișarea în stil organigramă (1 = sus, 2 = mijloc, 3 = jos) —
  // vezi pagina Profesori. Implicit 2 dacă lipsește.
  tier?: 1 | 2 | 3;
}
