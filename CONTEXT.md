# Seminarul Teologic Filadelfia — Context de business & domeniu

> Ce este site-ul, stack-ul + deciziile arhitecturale (cu motivele lor), structura codului și
> istoricul fazelor. Citește acest fișier DOAR când ai nevoie de detaliul respectiv — nu se
> încarcă automat. Regulile de proces, procedura de deploy, convențiile și verificarea rămân în
> `CLAUDE.md` (mereu în context). Istoricul modificărilor rămâne în `CHANGELOG.md`.

---

## Ce este

Reconstruire de la zero (greenfield) a `seminarulteologicfiladelfia.ro`, care era pe WordPress.
Plan complet de arhitectură: `C:\dev\persist\claude\plans\salutare-claude-haide-sa-transient-sifakis.md`.

Site instituțional (Despre Noi, Profesori, Studenți, Admitere, Programa, Absolvenți, Arhivă
foto/video, Contact) pentru Seminarul Teologic Filadelfia din Petroșani. **Seminarul face parte
din Biserica Filadelfia Petroșani** (`filadelfia-petrosani.ro`) — biserica e instituția-mamă, nu
un proiect „soră" egal. Footer-ul reflectă asta („Parte din Biserica Filadelfia Petroșani").

**Status (2026-08-20): predat clientului, nimic urgent rămas.** Singurul punct deschis, blocat pe
resurse externe pe care userul le aduce între sesiuni:
1. **Profesori — poze + listă** (`src/lib/content/profesori.ts`, singurul TODO de conținut) —
   așteaptă lista + fotografiile de la Seminar.

---

## Stack și decizii arhitecturale

- **Next.js 16 (App Router) + TypeScript strict**, deploy pe VPS OVHcloud (NU Vercel — abandonat
  definitiv pentru acest proiect).
- **Tailwind CSS v4** — configurare CSS-first (`@theme` în `src/app/globals.css`), **nu există
  `tailwind.config.ts`** (nu e nevoie de el în v4, nu-l recrea).
- **shadcn/ui cu Base UI** (`@base-ui/react`), nu Radix direct — preset-ul `shadcn init --defaults`
  („Nova"). Base UI folosește `render={<X />}` în loc de `asChild`. **Atenție:** `Button` cu
  `render={<Link .../>}` are nevoie explicit de `nativeButton={false}`, altfel Base UI aruncă o
  eroare în consolă (vezi `src/components/sections/hero.tsx`, `src/app/not-found.tsx`).
- **Conținut static** (Despre Noi, Admitere, Programa etc.) în `src/lib/content/*.ts` (tipizat prin
  `types.ts`), editat direct prin commit — nu prin admin UI.
- **Portal admin + student complet** (din 2026-07-20/21, Postgres pe VPS) — studenți / prezență /
  note / materiale / galerie foto. Schema Drizzle în `src/db/schema.ts`, auth pe sesiuni cookie,
  CRUD studenți cu ID generat aleator.
- **Galerie foto** — `gallery_albums` / `gallery_photos` în Postgres, poze în `public/gallery/<an>/`
  pe VPS, servite direct de nginx (`location /gallery/` alias, NU prin Next.js — Next nu recunoaște
  fișiere adăugate în `public/` după ultimul build, verificat empiric). Componentele publice
  (`GalleryCard`, `Lightbox`) folosesc `<img>` simplu, nu `next/image`. **Doar poze, fără video**
  (decizie explicită a userului, 2026-07-21). Admin gestionează din `/admin/galerie`.
- **Formular de contact prin Maileroo** (server-side, Server Action în `src/lib/contact/actions.ts`).
  NU EmailJS (abandonat 2026-07-21 — public key expus fără restricție de domeniu pe plan gratuit).
  NU Resend (planul free al userului limitat la 1 domeniu, deja ocupat pe alt proiect). Domeniu
  verificat în Maileroo (SPF/DKIM/DMARC prin Cloudflare DNS), trimite de la
  `contact@seminarulteologicfiladelfia.ro` (Reply-To pe emailul vizitatorului) către
  `seminar.filadelfia@gmail.com`. Validare Zod server-side + rate limiting pe IP
  (`src/lib/rate-limit.ts`, comun cu login-ul). Variabilă: `MAILEROO_API_KEY` (server-only).
- **Fonturi:** `Lora` (titluri, `--font-heading`) + `Inter` (corp, `--font-sans`) via `next/font/google`.
- **Next.js 16:** `params` / `searchParams` sunt `Promise` (await obligatoriu) — vezi
  `src/app/arhiva/[slug]/page.tsx` pentru pattern.

### Auth student — decizia de design (2026-07-20)

Documentată complet în `docs/decizie-infrastructura-si-functionalitati-noi.md` §7. **ID unic
generat aleator (nu secvențial, nu CNP) + parolă comună de student.** Risc acceptat explicit de
client (fără date de plată procesate real, doar afișare), condiția tehnică fiind ID-uri neghicibile.
Variante respinse (și de ce): CNP, magic link, user-parolă individuală — vezi documentul de decizie.

Extinderea a fost decisă cu clientul (2026-07-20): site-ul rămâne static pentru vizitatori, dar se
adaugă VPS + portal student cu autentificare — admin încarcă cursuri, ține catalog de prezență și
evidența plăților, gestionează arhiva absolvenților; studentul autentificat vede notele, prezența,
situația de plată și descarcă materialele.

---

## Structură

```
src/lib/content/        conținut static tipizat (types.ts, site-config.ts, despre-noi.ts, ...)
src/components/layout/   Header, Footer, MainNav (dropdown pe hover/focus), MobileNav (Sheet)
src/components/sections/ Hero, ContentSection, PageHeader, SubNav, ContentPage (wrapper reutilizat)
src/components/gallery/  GalleryGrid, GalleryCard, Lightbox (Dialog cu prev/next) — citesc din Postgres
src/components/contact/  ContactForm (Server Action, Zod server-side, Maileroo)
src/components/ui/       primitive shadcn (button, card, input, sheet, dialog, navigation-menu...)
src/components/app-shell/ shell propriu admin+portal (nav activ, nu moștenește header/footer public)
src/lib/gallery/         storage.ts (fișiere în public/gallery/<an>/) + actions.ts (Server Actions admin)
scripts/                 create-admin.ts, set-shared-password.ts — SQL generat, rulat manual
```

Fiecare pagină de conținut (despre-noi, studenti, admitere, absolventi) reutilizează `ContentPage`
(`src/components/sections/content-page.tsx`) cu un `ContentBlock` din `lib/content/*.ts` +
`getSubNavItems(parentHref)` din `site-config.ts` pentru sub-navigarea de tip tabs. Nu duplica
acest pattern — adaugă blocuri noi în content, nu markup nou per pagină.

Route-group `(site)` = zona publică (moștenește header/footer). Admin/portal (re-lucrate UI/UX
2026-07-21) au app-shell propriu în `src/components/app-shell/`, cu nav activ și dashboard-uri cu
statistici reale + empty states.

---

## Istoricul fazelor (context, nu jurnal — jurnalul e `CHANGELOG.md`)

- **Faza 1 (schelet + design system)** și **Faza 2 (toate paginile statice, text placeholder)** — complete.
- **Faza 3 — Galerie foto** — COMPLET 2026-07-21. 6 albume reale (37 poze: Absolvire
  2013/2014/2018, Cursuri 2018, Seminar 2016/2025).
- **Faza 4 — Contact live** — COMPLET 2026-07-21, prin Maileroo (migrat din EmailJS aceeași zi,
  motivul în CHANGELOG (40)). Testat live cu trimitere reală confirmată.
- **Faza 5 — Deploy** — live pe VPS cu domeniu și HTTPS.
- **Portalul admin+student** — cod scris 2026-07-20 (CHANGELOG (33)), live pe VPS din 2026-07-21.

### Istoricul infrastructurii

- **Setup inițial (2026-07-21):** VPS Hostinger KVM1, domeniu mutat pe Cloudflare de la Hosterion,
  A records `@`/`www` → IP VPS, proxy Cloudflare activ, certificat Let's Encrypt via certbot,
  nginx HTTP→HTTPS. Nu s-a pierdut email — domeniul nu avea MX înainte (verificat cu userul).
- **Migrare Hostinger → OVHcloud (2026-08-18):** IP nou `57.131.141.84`, Ubuntu 24.04, certificat
  **Cloudflare Origin CA** (valabil 15 ani, nu certbot) + SSL Cloudflare către vizitatori.
  Abonamentul Hostinger anulat definitiv după confirmarea că ambele site-uri (Seminar +
  `filadelfia-petrosani.ro`, migrate în aceeași sesiune) merg pe noul VPS. Detalii complete în
  `docs/arhitectura.md`.
- **Stare curentă pe VPS:** Postgres 16 (user dedicat `seminar_app`, doar localhost), Node 22,
  aplicația în `/var/www/app`, `pm2` (autostart la reboot), nginx reverse-proxy, `ufw` activ
  (22/80/443), backup zilnic `pg_dump` (cron 03:00, retenție 14 zile, scrie pe discul secundar
  `/mnt/backups/seminar/` din 2026-08-20 — vezi „Disc suplimentar" din `docs/deploy.md`).
