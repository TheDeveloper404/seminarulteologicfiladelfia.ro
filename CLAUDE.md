@AGENTS.md

# Seminarul Teologic Filadelfia — site nou

Reconstruire de la zero (greenfield) a seminarulteologicfiladelfia.ro, care era pe WordPress.
Plan complet de arhitectură: `C:\dev\persist\claude\plans\salutare-claude-haide-sa-transient-sifakis.md`.

**Ține la zi `CHANGELOG.md`** — după fiecare modificare făcută în acest repo, adaugă o intrare
nouă (dată + ce s-a schimbat). E arhiva de referință a proiectului, nu doar note interne.

## Ce este

Site instituțional (Despre Noi, Profesori, Studenți, Admitere, Programa, Absolvenți, Arhivă
foto/video, Contact) pentru Seminarul Teologic Filadelfia din Petroșani. **Seminarul face parte
din Biserica Filadelfia Petroșani** (filadelfia-petrosani.ro) — biserica e instituția-mamă, nu
un proiect "soră" egal. Footer-ul reflectă asta ("Parte din Biserica Filadelfia Petroșani").

## Stack și decizii arhitecturale

- **Next.js 16 (App Router) + TypeScript strict**, deploy pe Vercel. Domeniul
  `seminarulteologicfiladelfia.ro` există deja, se conectează la final (Faza 5).
- **Tailwind CSS v4** — configurare CSS-first (`@theme` în `src/app/globals.css`), **nu există
  `tailwind.config.ts`** (nu e nevoie de el în v4, nu-l recrea).
- **shadcn/ui cu Base UI** (`@base-ui/react`), nu Radix direct — asta a fost preset-ul curent al
  `shadcn init --defaults` (preset "Nova"). Componentele Base UI folosesc convenția `render={<X />}`
  în loc de `asChild` (pattern Radix). **Atenție:** `Button` cu `render={<Link .../>}` are nevoie
  explicit de `nativeButton={false}`, altfel Base UI aruncă o eroare în consolă (vezi
  `src/components/sections/hero.tsx`, `src/app/not-found.tsx`).
- **Fără DB, fără admin/CMS.** Tot conținutul text e în `src/lib/content/*.ts` (tipizat prin
  `src/lib/content/types.ts`), editat direct prin commit. Conținutul curent e **placeholder/TODO**
  — textele reale vin ulterior de la Seminar.
- **Vercel Blob** pentru galerii foto/video (`src/lib/content/galerii.ts`, azi gol — array
  `GalleryAlbum[]`). Populare manuală, fără admin UI runtime, printr-un script CLI (de scris în
  Faza 3, `scripts/upload-gallery.ts`).
- **Formular de contact prin EmailJS** (client-side, `@emailjs/browser`), NU prin API route +
  Resend. Decizie asumată explicit de user (risc acceptat: public key expus în bundle, fără
  rate-limiting server) — nu re-propune Resend fără un motiv nou concret. Trimite la
  `seminar.filadelfia@gmail.com`. Variabile: `NEXT_PUBLIC_EMAILJS_SERVICE_ID`,
  `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` (vezi `.env.local.example`).
- Fonturi: `Lora` (titluri, `--font-heading`) + `Inter` (corp, `--font-sans`) via `next/font/google`.
- Next.js 16: `params`/`searchParams` sunt `Promise` (await obligatoriu) — vezi
  `src/app/arhiva/[slug]/page.tsx` pentru pattern.

## Structură

```
src/lib/content/        conținut static tipizat (types.ts, site-config.ts, despre-noi.ts, ...)
src/components/layout/   Header, Footer, MainNav (dropdown pe hover/focus), MobileNav (Sheet)
src/components/sections/ Hero, ContentSection, PageHeader, SubNav, ContentPage (wrapper reutilizat)
src/components/gallery/  GalleryGrid, GalleryCard, Lightbox (Dialog cu prev/next)
src/components/contact/  ContactForm (react-hook-form + zod + EmailJS)
src/components/ui/       primitive shadcn (button, card, input, sheet, dialog, navigation-menu...)
scripts/                 (de creat în Faza 3) upload-gallery.ts — upload local → Vercel Blob
```

Fiecare pagină de conținut (despre-noi, studenti, admitere, absolventi) reutilizează
`ContentPage` (`src/components/sections/content-page.tsx`) cu un `ContentBlock` din
`lib/content/*.ts` + `getSubNavItems(parentHref)` din `site-config.ts` pentru sub-navigarea de tip
tabs. Nu duplica acest pattern — adaugă blocuri noi în content, nu markup nou per pagină.

## Ce urmează (handoff pentru continuare)

Faza 1 (schelet + design system) și Faza 2 (toate paginile statice, cu text placeholder) sunt
**complete**. Structura pentru Faza 3 (Arhiva) și Faza 4 (Contact) e deja scrisă, dar depinde de
resurse externe care lipsesc încă:

1. **Faza 3 — Galerii (ON HOLD)**: lipsește sursa pozelor (export din WordPress-ul vechi) și
   store-ul Vercel Blob nu e provizionat. Când sunt disponibile: `vercel:vercel-storage`/
   `vercel:marketplace` pentru provisioning, scrie `scripts/upload-gallery.ts` (`@vercel/blob`
   `put()`), populează `src/lib/content/galerii.ts`.
2. **Faza 4 — Contact live (ON HOLD)**: formularul e scris și funcțional, dar userul nu are încă
   acces pe `seminar.filadelfia@gmail.com`, deci contul EmailJS nu poate fi creat. Când are acces:
   cont EmailJS (service Gmail + template cu `{{from_name}}`, `{{from_email}}`, `{{phone}}`,
   `{{message}}`, Reply-To pe `{{from_email}}`, allowed domains setate) → cele 3 chei în
   `.env.local` (local) și Vercel (producție).
3. **Faza 5 — Deploy**: link proiect Vercel, env vars în dashboard, verificare rute, conectare
   domeniu `seminarulteologicfiladelfia.ro`.
4. **Text real**: Admitere (incl. Documente + PDF-uri în `public/documente/`), Programa și
   Absolvenți au deja conținut real. Singurul TODO rămas: **Profesori**
   (`src/lib/content/profesori.ts`) — blocat, așteaptă lista + pozele de la Seminar.

## Verificare

- `npm run build` după orice schimbare de tipuri/conținut — Tailwind v4 + Turbopack, type-check
  strict (nu te baza doar pe `npm run lint`).
- Pentru schimbări vizuale, verifică în browser (Playwright MCP disponibil) — homepage, o pagină
  de conținut cu sub-navigare, `/arhiva` (empty state), `/contact` (validare client), meniul mobil.
- **`HUMAN_RUNS_TESTS` activ** (`.claude/HUMAN_RUNS_TESTS` există) — userul rulează comenzile de
  test (ex. `npm run e2e` odată ce vor exista teste Playwright, Faza 5). Claude scrie/repară
  testele și rulează `tsc --noEmit` / `lint` / `build`, dar nu comenzi de test.
