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
**complete**. Faza 5 (deploy) e **parțial live**: site-ul rulează pe Vercel
(`seminarulteologicfiladelfia-ro.vercel.app`, branch `main`, deploy `46e30b9` promovat manual la
Production de user).

**Extindere majoră decisă cu clientul (2026-07-20), documentată complet în
`docs/decizie-infrastructura-si-functionalitati-noi.md`:** site-ul rămâne static pentru vizitatori,
dar se adaugă infrastructură (VPS Hostinger KVM1, migrare de pe Vercel — **fără Coolify**, userul
gestionează VPS-ul direct, decizie ulterioară documentului inițial care recomanda Coolify) + un
**portal student cu autentificare** (nu doar link-uri fără cont, cum era planul inițial pentru
materiale): admin încarcă cursuri, ține catalog online de prezență și evidența plăților,
gestionează arhiva absolvenților; studentul autentificat vede notele, prezența, situația de plată
și descarcă materialele. Auth student: **ID unic generat aleator (nu secvențial, nu CNP) + parolă
comună** — risc acceptat explicit de client (fără date de plată procesate real, doar afișare), cu
condiția tehnică ID-uri negribile. Detalii complete (variante evaluate, motive de respingere
CNP/magic link/user-parolă individuală) în documentul de decizie, secțiunea 7.

**Cod implementat (2026-07-20, vezi CHANGELOG (33)):** tot portalul admin+student e scris și
funcțional local — schema DB (Drizzle, `src/db/schema.ts`), auth admin+student pe sesiuni cookie,
CRUD studenți cu ID generat, prezență, plăți, note, materiale de curs (upload/download protejat),
arhivă absolvenți. Build+lint verificate curat. **Rulează doar local** — nu e deploy-uit, așteaptă
VPS-ul + `DATABASE_URL` real (vezi punctul 5 mai jos).

Rămân 5 lucruri, blocate pe resurse externe pe care userul le aduce între sesiuni:

1. **Profesori — poze + listă** (`src/lib/content/profesori.ts`, singurul TODO de conținut
   rămas): așteaptă lista de profesori + fotografiile de la Seminar.
2. **Faza 3 — Galerii (ON HOLD, opțional)**: userul decide dacă mai vrea galeria foto/video.
   **Planul Vercel Blob de mai jos e SUPERSEDAT** de extinderea din 2026-07-20 — dacă galeria se
   face, merge pe DB+storage de pe VPS (organizată pe ani de absolvire, upload din panelul admin),
   nu pe `scripts/upload-gallery.ts`+Vercel Blob. Vezi
   `docs/decizie-infrastructura-si-functionalitati-noi.md` secțiunea 3.
   ~~Dacă da: lipsește sursa pozelor (export din WordPress-ul vechi) și store-ul Vercel Blob nu e
   provizionat. Când sunt disponibile: `vercel:vercel-storage`/`vercel:marketplace` pentru
   provisioning, scrie `scripts/upload-gallery.ts` (`@vercel/blob` `put()`), populează
   `src/lib/content/galerii.ts`.~~
3. **Faza 4 — Contact live (ON HOLD)**: formularul e scris și funcțional, dar userul nu are încă
   acces pe `seminar.filadelfia@gmail.com`, deci contul EmailJS nu poate fi creat. Când are acces:
   cont EmailJS (service Gmail + template cu `{{from_name}}`, `{{from_email}}`, `{{phone}}`,
   `{{message}}`, Reply-To pe `{{from_email}}`, allowed domains setate) → cele 3 chei în
   `.env.local` (local) și Vercel (producție).
4. **Domeniu propriu — DNS**: `seminarulteologicfiladelfia.ro` e cumpărat pe Hosterion, nu pe
   Cloudflare. **Pașii c/d de mai jos (Vercel Domains) sunt SUPERSEDAȚI** de decizia VPS —
   țintele A/CNAME merg spre IP-ul VPS-ului, nu spre Vercel. De refăcut la momentul migrării, vezi
   `docs/decizie-infrastructura-si-functionalitati-noi.md` secțiunea 8. Pașii a/b (Cloudflare +
   nameserver la Hosterion) rămân valabili neschimbați:
   a. În Cloudflare: adaugă site-ul → Cloudflare scanează și propune înregistrările DNS
      existente (verifică-le manual, un scan poate rata înregistrări, mai ales MX pentru email).
   b. La Hosterion: schimbă nameserver-ii domeniului cu cei 2 alocați de Cloudflare (propagare
      DNS poate dura până la 24-48h, de obicei mult mai rapid).
   c. În Vercel: Project Settings → Domains → adaugă `seminarulteologicfiladelfia.ro` (+ `www`) →
      Vercel dă înregistrările A/CNAME țintă → adaugă-le în Cloudflare DNS.
   d. Cloudflare: proxy (norișorul portocaliu) poate rămâne activ pentru domeniul apex — Vercel
      funcționează prin Cloudflare proxied, dar dacă apar erori de SSL/redirect, treci temporar
      pe „DNS only" (gri) până se stabilește certificatul, apoi reactivează proxy dacă vrei WAF/CDN
      Cloudflare peste Vercel.
   e. Verifică și email-ul (`seminar.filadelfia@gmail.com` sau alt MX legat de domeniu, dacă
      există) — nu-l pierde la schimbarea nameserver-ilor; migrează și înregistrările MX/TXT
      (SPF/DKIM) găsite la pasul (a).
5. **Punerea în funcțiune a portalului admin+student pe VPS** (cod gata, vezi mai sus): userul
   cumpără/configurează VPS-ul Hostinger KVM1 (fără Coolify) și instalează Postgres + procesul
   Node. Apoi, în ordine: rulează manual fișierele din `drizzle/*.sql` pe Postgres-ul de pe VPS →
   setează `DATABASE_URL` real (`.env.local`/mediu de producție, vezi `.env.local.example`) →
   `npx tsx scripts/create-admin.ts <email> <parolă>` și `npx tsx scripts/set-shared-password.ts
   <parolă>` generează SQL de INSERT, rulat manual pe DB, pentru primul cont admin și parola
   comună de student. După asta `/admin/login` și `/portal/login` sunt funcționale.

După aceste 5, proiectul e considerat livrat.

## Verificare

- `npm run build` după orice schimbare de tipuri/conținut — Tailwind v4 + Turbopack, type-check
  strict (nu te baza doar pe `npm run lint`).
- Pentru schimbări vizuale, verifică în browser (Playwright MCP disponibil) — homepage, o pagină
  de conținut cu sub-navigare, `/arhiva` (empty state), `/contact` (validare client), meniul mobil.
- **`HUMAN_RUNS_TESTS` activ** (`.claude/HUMAN_RUNS_TESTS` există) — userul rulează comenzile de
  test (ex. `npm run e2e` odată ce vor exista teste Playwright, Faza 5). Claude scrie/repară
  testele și rulează `tsc --noEmit` / `lint` / `build`, dar nu comenzi de test.
