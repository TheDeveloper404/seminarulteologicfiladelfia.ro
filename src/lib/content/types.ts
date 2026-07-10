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
  role: string;
  photoUrl?: string;
  bio?: string;
}

export interface MediaItem {
  type: "image" | "video";
  url: string;
  thumbUrl?: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface GalleryAlbum {
  slug: string;
  title: string;
  date: string;
  coverImageUrl: string;
  items: MediaItem[];
}
