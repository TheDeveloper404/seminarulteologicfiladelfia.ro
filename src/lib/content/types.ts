export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export interface ContentBlock {
  heading: string;
  slug: string;
  summary: string;
  body: string[];
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
