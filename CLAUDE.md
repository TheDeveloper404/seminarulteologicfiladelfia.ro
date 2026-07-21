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
- **Conținutul textelor statice** (Despre Noi, Admitere, Programa etc.) rămâne în `src/lib/content/*.ts`
  (tipizat prin `src/lib/content/types.ts`), editat direct prin commit — nu prin admin UI.
  **Nu mai e valabil** că site-ul n-are DB/admin: din 2026-07-20/21 există portal admin+student
  complet (Postgres pe VPS) pentru studenți/prezență/note/materiale/galerie foto (vezi mai jos).
- **Galerie foto** (`gallery_albums`/`gallery_photos` în Postgres, poze în `public/gallery/<an>/`
  pe VPS, servite direct de nginx — vezi `src/lib/gallery/`). Admin gestionează din
  `/admin/galerie` (creează albume, încarcă/șterge poze). NU pe Vercel Blob (planul vechi,
  abandonat — proiectul nu mai e pe Vercel). **Doar poze, fără video** (decizie explicită a
  userului, 2026-07-21).
- **Formular de contact prin Maileroo** (server-side, Server Action în
  `src/lib/contact/actions.ts`), NU EmailJS (abandonat 2026-07-21 — public key expus fără
  restricție de domeniu pe plan gratuit) și NU Resend (planul free al userului limitat la 1
  domeniu, deja ocupat pe alt proiect). Domeniu `seminarulteologicfiladelfia.ro` verificat în
  Maileroo (SPF/DKIM/DMARC prin Cloudflare DNS), trimite de la
  `contact@seminarulteologicfiladelfia.ro` (Reply-To pe emailul vizitatorului) către
  `seminar.filadelfia@gmail.com`. Validare Zod server-side + rate limiting pe IP
  (`src/lib/rate-limit.ts`, comun cu login-ul). Variabilă: `MAILEROO_API_KEY` (server-only, fără
  `NEXT_PUBLIC_`, vezi `.env.local.example`).
- Fonturi: `Lora` (titluri, `--font-heading`) + `Inter` (corp, `--font-sans`) via `next/font/google`.
- Next.js 16: `params`/`searchParams` sunt `Promise` (await obligatoriu) — vezi
  `src/app/arhiva/[slug]/page.tsx` pentru pattern.

## Structură

```
src/lib/content/        conținut static tipizat (types.ts, site-config.ts, despre-noi.ts, ...)
src/components/layout/   Header, Footer, MainNav (dropdown pe hover/focus), MobileNav (Sheet)
src/components/sections/ Hero, ContentSection, PageHeader, SubNav, ContentPage (wrapper reutilizat)
src/components/gallery/  GalleryGrid, GalleryCard, Lightbox (Dialog cu prev/next) — citesc din Postgres
src/components/contact/  ContactForm (Server Action, Zod server-side, Maileroo)
src/components/ui/       primitive shadcn (button, card, input, sheet, dialog, navigation-menu...)
src/lib/gallery/         storage.ts (fișiere în public/gallery/<an>/) + actions.ts (Server Actions admin)
scripts/                 create-admin.ts, set-shared-password.ts — SQL generat, rulat manual
```

Fiecare pagină de conținut (despre-noi, studenti, admitere, absolventi) reutilizează
`ContentPage` (`src/components/sections/content-page.tsx`) cu un `ContentBlock` din
`lib/content/*.ts` + `getSubNavItems(parentHref)` din `site-config.ts` pentru sub-navigarea de tip
tabs. Nu duplica acest pattern — adaugă blocuri noi în content, nu markup nou per pagină.

## Ce urmează (handoff pentru continuare)

Faza 1 (schelet + design system) și Faza 2 (toate paginile statice, cu text placeholder) sunt
**complete**. Faza 5 (deploy) e **live pe VPS, cu domeniu și HTTPS** (2026-07-21, vezi CHANGELOG):
site-ul rulează acum pe VPS-ul Hostinger KVM1 (`31.97.47.182`, Ubuntu 24.04, Frankfurt), NU pe
Vercel — Vercel a fost abandonat definitiv pentru acest proiect. Domeniul
`seminarulteologicfiladelfia.ro` e conectat prin Cloudflare (proxy activ, portocaliu), cu HTTPS
end-to-end: certificat Let's Encrypt pe VPS (auto-reînnoire via systemd timer certbot) + SSL
Cloudflare către vizitatori. Stack pe VPS: Postgres 16 (user dedicat `seminar_app`, doar
localhost), Node 22, aplicația în `/var/www/app` (clonată din `main`), `pm2` (pornește automat la
reboot), nginx reverse-proxy, `ufw` activ (22/80/443 deschise). Portalul admin+student e complet
funcțional live: cont admin creat, parolă comună de student setată. Admin/portal au fost
re-lucrate UI/UX (2026-07-21): nu mai moștenesc header/footer-ul public (mutate în route-group
`(site)`), au app-shell propriu (`src/components/app-shell/`) cu nav activ, dashboard-uri cu
statistici reale și empty states corecte.

**Deploy-uri viitoare pe VPS**: nu există încă pipeline automat — actualizarea codului pe server
se face manual (`git pull` sau copiere `src/`, apoi `npm run build` + `pm2 restart seminar-app`).
De discutat cu userul dacă merită un script/CI simplu odată ce ritmul de modificări se stabilizează.
**Important (din 2026-07-21, audit infra):** aplicația rulează pe VPS ca user dedicat `seminar`
(NU root — hardening de securitate), pm2 e pornit sub `su - seminar -c '...'`, nu direct ca root.
Orice comandă de deploy/pm2/npm pe server trebuie rulată ca `seminar`, altfel proprietarul
fișierelor din `/var/www/app` (inclusiv `public/gallery/` și `uploads/`) se strică.

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
arhivă absolvenți. Build+lint verificate curat. **Live pe VPS din 2026-07-21** (vezi secțiunea de
deploy de mai sus) — punctele 4 și 5 de mai jos (DNS + VPS) sunt acum COMPLETE.

Rămâne 1 lucru, blocat pe resurse externe pe care userul le aduce între sesiuni:

1. **Profesori — poze + listă** (`src/lib/content/profesori.ts`, singurul TODO de conținut
   rămas): așteaptă lista de profesori + fotografiile de la Seminar.

**Faza 3 — Galerie foto (COMPLET, 2026-07-21):** `gallery_albums`/`gallery_photos` în Postgres,
poze în `public/gallery/<an>/` pe VPS, servite direct de nginx (`location /gallery/` alias, NU
prin Next.js — Next nu recunoaște fișiere adăugate în `public/` după ultimul build, verificat
empiric). Componentele publice (`GalleryCard`, `Lightbox`) folosesc `<img>` simplu, nu
`next/image` — evită orice dependență de manifestul de build al Next pentru conținut încărcat
dinamic de admin. Populate 6 albume reale (37 poze: Absolvire 2013/2014/2018, Cursuri 2018,
Seminar 2016/2025) din poze furnizate de user. **Doar poze, fără video** — decizie explicită.

**Faza 4 — Contact live (COMPLET, 2026-07-21):** trece prin Maileroo (nu EmailJS, migrat în
aceeași zi — vezi CHANGELOG (40) pentru motiv). Domeniu verificat, `MAILEROO_API_KEY` pe VPS,
testat live cu trimitere reală confirmată (primul email a intrat în Spam — normal, domeniu nou;
rezolvat cu „Not spam" în Gmail, al doilea test a intrat direct în Inbox).

**DNS + HTTPS (COMPLET, 2026-07-21):** domeniul e pe Cloudflare (nameserver mutați de la
Hosterion), A records `@` și `www` → IP-ul VPS-ului, proxy Cloudflare activ (portocaliu).
Certificat Let's Encrypt instalat pe VPS via certbot (auto-reînnoire prin systemd timer),
nginx redirectează HTTP→HTTPS. Nu s-a pierdut email — domeniul nu avea MX configurat înainte de
migrare (verificat cu userul).

După ce se rezolvă cele 3 puncte de mai sus, proiectul e considerat livrat.

## Verificare

- `npm run build` după orice schimbare de tipuri/conținut — Tailwind v4 + Turbopack, type-check
  strict (nu te baza doar pe `npm run lint`).
- Pentru schimbări vizuale, verifică în browser (Playwright MCP disponibil) — homepage, o pagină
  de conținut cu sub-navigare, `/arhiva` (empty state), `/contact` (validare client), meniul mobil.
- **`HUMAN_RUNS_TESTS` activ** (`.claude/HUMAN_RUNS_TESTS` există) — userul rulează comenzile de
  test (ex. `npm run e2e` odată ce vor exista teste Playwright, Faza 5). Claude scrie/repară
  testele și rulează `tsc --noEmit` / `lint` / `build`, dar nu comenzi de test.
