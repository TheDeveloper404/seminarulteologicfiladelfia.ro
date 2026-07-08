# Changelog

Arhivă a tuturor modificărilor aduse acestui proiect. Fiecare intrare: dată + ce s-a schimbat.
Nu e un changelog de release (nu există versiuni publicate încă) — e jurnalul de lucru al
proiectului, actualizat după fiecare set de modificări.

## 2026-07-08 (3)

- Scris `.remember/remember.md` (handoff pentru sesiunea viitoare — state, next, context).
- `.gitignore`: adăugat explicit `.remember/` la rădăcină (era deja ignorat prin `.remember/.gitignore`
  intern, dar l-am făcut explicit pentru robustețe). Confirmat că nu mai există fișiere neurmărite
  în afara celor deja ignorate (`node_modules/`, `.next/`, `.claude/`, `.remember/`, `next-env.d.ts`).

## 2026-07-08 (2)

- Activat `HUMAN_RUNS_TESTS` (`.claude/HUMAN_RUNS_TESTS` creat) — userul rulează comenzile de test
  (consecvență cu convenția din proiectul DETALIA), Claude scrie/repară teste + rulează
  `tsc`/`lint`/`build`. Documentat în `CLAUDE.md` → „Verificare".

## 2026-07-08

**Scaffold inițial + Faza 1 (design system) + Faza 2 (pagini statice) + schelet Faza 3/4.**

- Scaffold Next.js 16 (App Router, TypeScript strict, Tailwind v4, ESLint) via `create-next-app`,
  păstrând `.remember/` existent din director.
- `shadcn init --defaults` (preset Nova, Base UI în loc de Radix) + adăugate componente: button,
  card, input, label, textarea, separator, tabs, badge, navigation-menu, sheet, dialog.
- Paletă de design navy + auriu în `src/app/globals.css` (`@theme`, tokens HSL), portată din
  proiectul înrudit filadelfia-petrosani.ro (biserica-mamă a Seminarului). Fonturi `Lora`
  (titluri) + `Inter` (corp) via `next/font/google`.
- `next.config.ts`: `images.remotePatterns` pentru `*.public.blob.vercel-storage.com` (pregătire
  pentru galerii pe Vercel Blob).
- Model de conținut static tipizat: `src/lib/content/types.ts`
  (`ContentBlock`, `StaffMember`, `GalleryAlbum`, `MediaItem`, `NavItem`), `site-config.ts`
  (meniu principal, date de contact, `getSubNavItems()`), și fișiere de conținut placeholder/TODO:
  `despre-noi.ts`, `studenti.ts`, `admitere.ts`, `absolventi.ts`, `programa.ts`, `profesori.ts`,
  `galerii.ts` (gol deocamdată).
- Layout: `Header`, `Footer` (cu link către filadelfia-petrosani.ro ca instituție-mamă),
  `MainNav` (dropdown pe hover/focus pentru meniurile cu sub-pagini), `MobileNav` (drawer via
  `Sheet`, sub-meniuri ca `<details>`).
- Secțiuni reutilizabile: `Hero`, `ContentSection` (card "Citește mai mult"), `PageHeader`,
  `SubNav` (tabs secundare), `ContentPage` (wrapper folosit de toate paginile de conținut).
- Toate cele 24 de rute din structura de meniu (Acasă, Despre Noi + 7 subpagini, Profesori,
  Studenți + 5 subpagini, Admitere + 4 subpagini, Programa educațională, Absolvenți + 2
  subpagini, Arhiva, Arhiva/[slug], Contact) — conținut placeholder, gata de populat.
- Galerie: `GalleryGrid` (cu empty state), `GalleryCard`, `Lightbox` (Dialog cu navigare
  prev/next, suport imagine + video), rutele `/arhiva` și `/arhiva/[slug]` (`generateStaticParams`
  din `galerii.ts`, async `params` per Next.js 16).
- Formular de contact: `ContactForm` (react-hook-form + zod, honeypot anti-spam) trimis prin
  **EmailJS client-side** (`@emailjs/browser`) către `seminar.filadelfia@gmail.com` — decizie
  explicită a userului în locul unui API route + Resend (risc acceptat conștient). `.env.local.example`
  cu variabilele `NEXT_PUBLIC_EMAILJS_*`.
- `sitemap.ts`, `robots.ts`, `not-found.tsx`, `error.tsx`, metadata cu title template în
  `layout.tsx`.
- Fix: eroare Base UI în consolă (`Button` cu `render={<Link/>}` avea nevoie de
  `nativeButton={false}`) — corectat în `Hero` și `not-found.tsx`.
- Verificare: `npm run build` (32 rute generate static, type-check curat), `npm run lint`
  (0 erori), verificare vizuală în browser via Playwright MCP — homepage, pagină de conținut cu
  sub-navigare, `/arhiva` (empty state), `/contact` (validare client fără request greșit),
  meniu mobil (390×844).
- Curățenie: eliminat SVG-urile boilerplate din `create-next-app` (`public/*.svg`) nefolosite.
- `CLAUDE.md` populat cu documentația proiectului (stack, decizii, structură, handoff pentru
  fazele următoare). Creat acest `CHANGELOG.md`.
- **Notă de proces**: am comis o dată din greșeală via terminal — anulat imediat
  (`git update-ref -d HEAD`, fișierele au rămas staged). Userul comite exclusiv din VS Code
  Source Control; toate modificările de mai sus sunt **staged, necomise**.

### Rămâne de făcut (vezi și `CLAUDE.md` → „Ce urmează”)

- Faza 3: sursă poze (export WordPress vechi) + provisioning Vercel Blob + `scripts/upload-gallery.ts`.
- Faza 4: cont EmailJS real (service/template/public key) în `.env.local` + Vercel.
- Faza 5: conectare domeniu + deploy producție.
- Text real în `src/lib/content/*.ts` (în prezent toate sunt `"TODO: ..."`).
