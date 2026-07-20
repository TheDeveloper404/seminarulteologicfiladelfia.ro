# Changelog

Arhivă a tuturor modificărilor aduse acestui proiect. Fiecare intrare: dată + ce s-a schimbat.
Nu e un changelog de release (nu există versiuni publicate încă) — e jurnalul de lucru al
proiectului, actualizat după fiecare set de modificări.

## 2026-07-20 (33)

- Implementat portalul admin + student descris în
  `docs/decizie-infrastructura-si-functionalitati-noi.md` secțiunea 7 (auth ID unic + parolă
  comună, respinsă varianta CNP din motive de securitate/GDPR — vezi document). Stack nou:
  Drizzle ORM + Postgres (`src/db/schema.ts`: `admins`, `students`, `sessions`, `attendance`,
  `payments`, `grades`, `course_materials`, `app_settings`), migrări SQL generate în `drizzle/`
  (rulate manual pe server, nicio migrare automată din terminal).
  - **Auth**: sesiuni server-side pe cookie httpOnly (fără JWT), hash sha256 al token-ului stocat
    în DB, parole cu bcrypt. Rute separate `/admin/login` și `/portal/login`, protejate prin route
    groups `(protected)`. Rate limiting in-memory (10 încercări/15 min per IP) pe ambele
    formulare de login — atenuare directă a riscului acceptat la parola comună de student.
  - **Admin** (`/admin`): CRUD studenți cu generare automată de ID unic aleator (non-secvențial,
    `src/lib/students/generate-public-id.ts`), catalog de prezență pe sesiune lunară, plăți per
    student, note per student, upload materiale de curs (fișiere pe disc VPS, tipuri de fișier
    restricționate, în afara `public/`), arhivă absolvenți (flag `graduated` pe student).
  - **Student** (`/portal`): vede prezența proprie, situația de plată, notele, descarcă
    materialele de curs — descărcarea trece printr-o rută API protejată de sesiune
    (`/api/materiale/[id]`), nu prin fișiere publice.
  - Scripturi CLI `scripts/create-admin.ts` și `scripts/set-shared-password.ts` — generează SQL
    de INSERT/UPSERT (hash bcrypt), rulat manual pe DB, consecvent cu restul proiectului.
  - `next.config.ts`: `bodySizeLimit` Server Actions crescut la 50MB pentru upload materiale.
  - Build + lint verificate curat (`npm run build`, `npm run lint`). Nu sunt încă teste automate.
  - **Nu e livrat/deploy-uit** — codul rulează doar local, așteaptă VPS-ul (Hostinger, fără
    Coolify, gestionat de user) + `DATABASE_URL` real pentru a fi funcțional.

## 2026-07-20 (36)

- Header prea înghesuit cu 9 pagini principale + butonul nou de Portal: mărit containerul
  paginilor de la `max-w-[90rem]` la `max-w-[100rem]` (header, footer al conținutului,
  content-page, sub-nav, page-header, homepage, arhivă, profesori), mărit spațiul dintre linkurile
  din nav (`main-nav.tsx`: `gap-0.5`→`gap-1.5`, padding linkuri `px-2.5`→`px-3.5`), mutat pragul de
  comutare la meniul mobil de la `xl` (1280px) la `2xl` (1536px) — sub acel prag intră meniul
  hamburger în loc să înghesuie 9 linkuri + logo + buton pe o singură linie. Butonul „Portal
  studenți” din header schimbat din `outline` în stilul plin (`default`, bg-primary) ca să iasă
  vizual în evidență față de restul linkurilor. Verificat vizual în browser la 1440px și 1920px.

## 2026-07-20 (35)

- Adăugat acces vizibil către portalul de studenți pe site-ul public: buton „Portal studenți” în
  `Header` (vizibil pe toate paginile, desktop + meniul mobil), spre `/portal/login`. În hero-ul
  homepage-ului (`src/app/page.tsx`), CTA-ul principal „Admitere” a fost înlocuit cu „Portal
  studenți” (decizie user) — „Admitere” rămâne accesibil din meniul principal (dropdown), doar nu
  mai e CTA-ul principal din hero.

## 2026-07-20 (34)

- Eliminată complet funcționalitatea de plăți din portalul admin+student (tabela `payments`,
  `src/lib/payments/`, paginile `/admin/studenti/[id]/plati` și `/portal/plati`, link-urile de
  nav). Decizie user: nu are sens de afișat "cât a plătit" fără integrare reală de plată —
  informația fără procesare din spate nu aduce valoare. Migrare SQL nouă
  (`drizzle/0003_sharp_paibok.sql`, `DROP TABLE payments`) de rulat manual pe DB, alături de
  celelalte din CHANGELOG (33). Build+lint verificate curat.

## 2026-07-18 (32)

- Adăugat `docs/decizie-infrastructura-si-functionalitati-noi.md`: document de decizie pentru
  client, pentru trei cereri noi (galerie foto pe ani de absolvire, catalog digital de prezență,
  distribuție materiale de curs fără conturi de studenți) și infrastructura care le susține.
  Comparație Vercel-native vs. VPS gol vs. VPS+Coolify (recomandat: VPS+Coolify pe Hostinger
  KVM1, facturare anuală, un singur dashboard). Pentru materiale de curs, trei variante rămase
  deschise pentru discuție cu clientul (Drive/MEGA manual, Drive/MEGA + evidență în admin,
  sistem custom cu token și expirare automată la 3 zile) — recomandare împotriva variantei
  custom din motive de risc de securitate vs. beneficiu marginal. Nu s-a scris cod încă; e
  materialul de decizie dinaintea planului de implementare.

## 2026-07-10 (31)

- Deploy pe Vercel promovat manual la Production de user (commit `46e30b9`, branch `main`) —
  mesajul rezidual „push to the `master` branch" din UI e text cache-uit al Vercel, nu afectează
  funcționarea; Production Branch trebuie verificat/actualizat pe `main` în Settings → Git al
  proiectului pentru ca deploy-urile viitoare să meargă automat pe Production fără promovare
  manuală.
- Text din paginile de conținut (`content-page.tsx`, folosit de toate paginile Despre Noi,
  Admitere, Studenți, Absolvenți etc.): blocul de body avea `ml-10` fix, care îl împingea spre
  marginea stângă pe ecrane late în loc să fie centrat — schimbat în `mx-auto` (centrat corect
  în container). Dimensiunea textului mărită cu un pas: `text-sm`→`text-base` (mobil),
  `text-base`→`text-lg` (desktop), atât pe layout-ul normal cât și pe cel compact (grid 2
  coloane). Verificat vizual pe `/admitere/evaluare`.

## 2026-07-10 (30)

- Branch-ul repo-ului redenumit de user pe GitHub din `master` în `main`; clona locală
  aliniată (`git branch -m`, tracking pe `origin/main`, ref-ul vechi curățat). Decizie de
  proces asumată de user: site static, se lucrează direct pe `main`, fără ceremonia
  `dev` → PR (regula globală dev/PR nu se aplică aici).
- Header-e de securitate în `next.config.ts` pe toate rutele: Content-Security-Policy
  (calibrat: `connect-src` doar EmailJS, `img/media-src` + Vercel Blob, `frame-ancestors
  'none'`, `'unsafe-eval'` doar în dev pentru Fast Refresh), X-Content-Type-Options,
  X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS.
- `npm audit`: 2 vulnerabilități moderate (postcss@8.4.31 vechi, intern în next@16.2.10)
  rezolvate cu `overrides: { postcss: "^8.5.16" }` în package.json → 0 vulnerabilități.
- Fix 404 la prefetch: butonul „Admitere" din hero trimitea la `/admitere` (rută inexistentă,
  există doar subpaginile) — acum trimite la `/admitere/conditii`.
- Efect ușor de intrare la navigarea între pagini (cerut explicit de user, alt mecanism decât
  crossfade-ul ViewTransition respins anterior): `src/app/template.tsx` (se re-montează la
  fiecare navigare) + animația `page-enter` în `globals.css` (fade + translateY 0.5rem, 300ms,
  doar conținutul paginii — nu header/footer; dezactivat la `prefers-reduced-motion`).
- Verificat pe build de producție local (Playwright): homepage + /admitere/conditii fără
  erori de consolă, CSP-ul nu blochează nimic, 404-ul dispărut.

## 2026-07-10 (29)

- Fix încărcare lentă a imaginii hero la refresh (raportat de user pe deploy-ul Vercel):
  `public/images/1.png` (PNG foto, 1,5 MB) convertit în `public/images/hero.jpg`
  (JPEG mozjpeg q80, 106 KB, −93%); în `hero.tsx` trecut pe import static cu
  `placeholder="blur"` (placeholder blurat instant la load) și `sizes="100vw"`
  (variante responsive corecte). PNG-ul vechi șters. Build verificat curat.
- Site-ul publicat pe Vercel de user: `seminarulteologicfiladelfia-ro.vercel.app`
  (Faza 5 parțial — domeniul propriu încă neconectat).

## 2026-07-10 (28)

- Favicon din logo-ul Seminarului (porumbelul din `public/logoheader.png`): generate
  `src/app/icon.png` (512px), `src/app/apple-icon.png` (180px) și `src/app/favicon.ico`
  (multi-size) — înlocuit favicon-ul default Next.js. Servite automat de App Router
  (convenția de fișiere `icon.*`), fără cod suplimentar.
- Handoff actualizat în `CLAUDE.md`: Faza 3 (Galerii) și Faza 4 (Contact/EmailJS) marcate
  ON HOLD (userul nu are încă acces pe `seminar.filadelfia@gmail.com`); punctul „Text real"
  actualizat — Admitere/Documente, Programa și Absolvenți au conținut real, singurul TODO
  rămas e Profesori (așteaptă lista + pozele).
- Verificare pre-deploy pentru Faza 5: `npm run build` curat (31 rute statice), `npm run lint`
  curat, fără secrete hardcodate, `robots.ts`/`sitemap.ts` pe domeniul de producție,
  `.gitignore` acoperă `.env*`. Optimizarea mobile responsive amânată la cererea userului
  (se face după deploy).

## 2026-07-10 (27)

- Investigat efectul de tranziție de pe filadelfia-petrosani.ro (bundle-ul JS analizat):
  site-ul lor NU are nicio animație între pagini — e un SPA (Vite + React Router) cu swap
  instant de conținut și `scrollTo instant`; senzația de „lin” vine doar din lipsa
  reload-ului complet. Verificat că site-ul nostru folosește peste tot `next/link` (niciun
  `<a>` intern cu reload). Reintrodus apoi `<ViewTransition>` (crossfade nativ) la cererea
  userului și eliminat din nou definitiv la respingerea lui — starea finală: FĂRĂ efect de
  tranziție (`next.config.ts` și `layout.tsx` curate). NU reîncerca acest subiect fără
  exemplu concret de la user.

## 2026-07-10 (26)

- Eliminat complet efectul de tranziție la navigare — userul nu l-a vrut deloc, nu doar
  ajustat. Scos `experimental.viewTransition` din `next.config.ts`, `<ViewTransition>` din
  `layout.tsx`. Comportament revenit la navigare instant, fără animație.

## 2026-07-10 (25)

- Efect de tranziție simplificat la maximum, la cererea userului (site teologic → ton sobru,
  fără animație elaborată; trebuie să meargă bine și pe mobil). Eliminat tot CSS-ul custom
  (`.fade-page`, keyframes, `prefers-reduced-motion` override) — `<ViewTransition>` folosit
  fără props, doar crossfade-ul implicit al browserului (View Transitions API nativ), zero
  cod de animație de întreținut.

## 2026-07-10 (24)

- Efect de tranziție la navigare, ajustat din nou la cererea userului — vrea „un fade ușor,
  aproape insesizabil”, nu un crossfade vizibil. Redus de la 220ms/opacity 0→1 la 120ms și
  opacitate doar între 1 și 0.85 (nu ajunge la 0) — abia perceptibil, doar ca să înmoaie
  tăietura bruscă dintre pagini.

## 2026-07-10 (23)

- Efect de tranziție la navigarea între pagini: activat `experimental.viewTransition: true`
  în `next.config.ts` (Next.js 16 + React `<ViewTransition>` — vezi
  `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`). `layout.tsx` încadrează
  `{children}` în `<ViewTransition default="fade-page">`. CSS în `globals.css`
  (`::view-transition-old/new(.fade-page)`) — crossfade simplu, doar opacitate, 220ms
  simetric (prima variantă avea și un `translateY`, eliminat la cererea userului). Respectă
  `prefers-reduced-motion`.

## 2026-07-10 (22)

- Redesign secțiunea de mijloc de pe Acasă (Cine Suntem/Misiune/Istoric) — era carduri plate,
  fără context, plutind pe fundal alb. Acum: fundal `bg-muted/40` diferențiat de restul
  paginii, titlu de secțiune deasupra cardurilor („Despre Seminar” + „Descoperă cine
  suntem”), și câte o iconiță (`Users`/`Compass`/`History`, lucide-react) pe fiecare card —
  cerc `bg-secondary/15`, consistent cu stilul deja folosit pe pagina Contact. `ContentSection`
  primește acum prop opțional `icon?: LucideIcon`.

## 2026-07-10 (21)

- Revert tranzițiile fade Hero/Footer din (20) — nu arătau bine. Hero revenit fără stratul
  suplimentar de fade la bază; Footer revenit la `border-t border-border` (linia dreaptă de
  sus), fără gradientul de fade.

## 2026-07-10 (20)

- Tranziții line între Hero/Footer și secțiunea albă din mijloc, înlocuite cu fade. Hero:
  strat suplimentar `bg-gradient-to-b from-transparent to-background` pe ultimii `h-24`/`h-32`
  (marginea de jos se stinge spre culoarea paginii, nu se termină brusc în albastru solid).
  Footer: eliminat `border-t border-border` (linia dură de sus), înlocuit cu
  `bg-gradient-to-b from-background to-transparent` pe primii `h-24`/`h-32` — marginea de sus
  pornește din culoarea paginii și se stinge spre `bg-primary`.

## 2026-07-10 (19)

- Hero: imaginea de fundal (`1.png`) mărită la `opacity-70` (de la `opacity-40`) și
  gradienturile de fade slăbite (`from-primary/70` → `from-primary/40`, `to-primary/40` →
  `to-primary/25`) — era prea ștearsă, acum poza e mai vizibilă.

## 2026-07-10 (18)

- Hero: `public/images/1.png` (poză mâini + Biblie deschisă, fundal blur albastru/teal —
  paletă foarte apropiată de `bg-primary`) integrată ca fundal full-bleed în spatele
  textului, cu `opacity-40` și două gradienturi de fade (`from-primary/70 via-primary/85
  to-primary` pe verticală, plus un al doilea gradient pentru margini) ca poza să se topească
  în `bg-primary` fără muchii vizibile și textul să rămână lizibil. Blob-urile animate rămân
  deasupra, ca strat suplimentar de textură.

## 2026-07-10 (17)

- Eliminate paginile index `/studenti` și `/admitere` (fișiere `page.tsx` șterse,
  `studentiIntro`/`admitereIntro` scoase din `lib/content/*.ts`), la fel ca la Absolvenți —
  itemii din `site-config.ts` marcați `linkable: false`, dropdown-ul rămâne neschimbat spre
  subpagini.
- `main-nav.tsx` rescris de la zero pe componenta `NavigationMenu` (Base UI, deja instalată
  în `ui/navigation-menu.tsx`) în loc de dropdown-uri CSS independente pe fiecare item
  (`group-hover`). Rezolvă bug-ul raportat: mutarea mouse-ului de la un dropdown deschis spre
  itemul vecin lăsa primul deschis și cele două panouri absolut poziționate se suprapuneau —
  cauza era că fiecare dropdown avea propriul panou independent, suficient de lat încât să
  acopere vizual triggerul vecin și să-i blocheze hover-ul. `NavigationMenu` folosește un
  singur viewport/panou partajat la nivel de meniu (poziționat și animat de Base UI), deci nu
  mai pot exista două panouri deschise simultan. Toate itemele cu copii (inclusiv Despre Noi)
  sunt acum triggere pure (buton, fără navigare directă la click) — consistent cu
  Studenți/Admitere/Absolvenți; paginile index ale grupurilor rămân accesibile prin primul
  copil din dropdown (ex. „Cine Suntem” → `/despre-noi`).

## 2026-07-10 (16)

- Cardurile de pe Acasă (`content-section.tsx`, Cine Suntem/Misiune/Istoric): întregul card e
  acum un `Link` clickabil (nu doar linkul „Citește mai mult” de jos), cu animație pe hover —
  ridicare ușoară (`hover:-translate-y-1`), umbră mai pronunțată, contur `border-primary/30`,
  și săgeata care alunecă spre dreapta (`group-hover:translate-x-1`).

## 2026-07-10 (15)

- Footer: forțat pe un singur rând la ≥lg (`flex-wrap` → `lg:flex-nowrap`, `whitespace-nowrap`
  pe fiecare segment), container lărgit la `max-w-7xl`, text mărit (`text-sm` → `text-base`,
  numele Seminarului `text-lg`), iconițele telefon/mail mărite (`size-9` → `size-10`).

## 2026-07-10 (14)

- Footer rescris complet conform layout-ului cerut: un singur rând (wrap pe mobil) —
  „Seminarul Teologic Filadelfia | Școală teologică evanghelică protestantă conservatoare
  | Parte din Biserica Filadelfia Petroșani | Contact” urmat de două iconițe (telefon, mail).
  Descrierea nu mai repetă „Petroșani” (apare deja în „Parte din...”). Iconițele au tooltip
  retractabil pe hover (`group`/`group-hover:opacity-100`) — telefon arată ambele numere,
  mail arată adresa; fără click, doar hover (`pointer-events-none` până la hover). Logo scos
  din footer (nu era în specificația nouă). Container `max-w-5xl`.

## 2026-07-10 (13)

- Revert footer la varianta anterioară „rândului unic” (blocuri stivuite, spread stânga/dreapta,
  `max-w-4xl`, texte `text-sm`) — versiunea cu tot pe un singur rând nu a fost pe plac.
- Hero: titlul revenit la culoarea implicită (`text-primary-foreground`), fără `text-secondary`
  (auriu).

## 2026-07-10 (12)

- Footer: logo+nume, descriere și „Parte din...” puse pe un singur rând (separator „|”) la
  ≥lg, în loc de bloc vertical stivuit; Contact rămâne pe partea opusă, aliniat dreapta la
  ≥lg. Container lărgit la `max-w-6xl` (de la `max-w-4xl`) ca să încapă rândul unic. Texte
  mărite (`text-sm` → `text-base`, numele Seminarului `text-lg`, logo `h-9` → `h-10`).

## 2026-07-10 (11)

- Footer: eliminată coloana „Navigare rapidă”. Text descriptiv de sub numele Seminarului
  rescris, mai scurt („Școală teologică evanghelică protestantă conservatoare din Petroșani.”).
  Container îngustat (`max-w-[90rem]` → `max-w-4xl`), layout schimbat din `grid-cols-3`
  centrat în `flex justify-between` — cele două blocuri (identitate / Contact) se întind spre
  marginile footer-ului în loc să fie grupate central, coloana Contact aliniată la dreapta pe
  ecrane ≥sm. `siteConfig.description` și `shortName` eliminate din `site-config.ts`
  (rămăseseră neutilizate).

## 2026-07-10 (10)

- Hero: inspirat (nu identic) din layout-ul de pe filadelfia-petrosani.ro (verificat cu
  Playwright) — text centrat (`max-w-3xl mx-auto text-center`), titlu în `text-secondary`
  (auriu) în loc de `primary-foreground`, al doilea buton CTA (`variant="outline"`, prop nou
  `secondaryCtaLabel`/`secondaryCtaHref` pe `Hero`). Homepage: CTA secundar „Contact” adăugat
  lângă „Admitere”. Fundalul rămâne gradientul animat CSS (fără poză) — decizie explicită a
  userului, nu s-a preluat fundalul foto (cer/siluetă cruce) de pe site-ul bisericii.

## 2026-07-10 (9)

- Hero: revenit la layout single-column (fără `hero.png`, șters din `public/`). Adăugat fundal
  animat CSS — 3 „blob"-uri de gradient (`bg-secondary`/`bg-primary-foreground`, `blur-3xl`)
  care plutesc lent (`@keyframes hero-drift-a/b/c`, 18-26s, `ease-in-out infinite`) peste
  `bg-primary`, definite în `globals.css`; respectă `prefers-reduced-motion: reduce`
  (animația se dezactivează).

## 2026-07-10 (8)

- Hero: eliminat ring-ul/conturul din jurul imaginii (`hero.tsx`) — frame rămâne doar
  `rounded-3xl overflow-hidden`, fără `ring-1`.
- Eliminată pagina index `/absolventi` (`src/app/absolventi/page.tsx` șters, `absolventiIntro`
  scos din `lib/content/absolventi.ts`). `NavItem` are acum `linkable?: boolean`
  (`lib/content/types.ts`); itemul „Absolvenți” din `site-config.ts` e `linkable: false` —
  eticheta din meniu (desktop și mobil) deschide doar dropdown-ul spre Promovabilitate și
  Încheiere pregătire, fără să navigheze ea însăși. Footer-ul (link „Navigare rapidă”)
  actualizat să trimită la primul copil pentru itemii `linkable: false`.

## 2026-07-10 (7)

- Hero: layout rescris pe 2 coloane (`lg:grid-cols-[minmax(0,22rem)_1fr]`) — `public/hero.png`
  integrat în coloana stângă, încadrat într-un frame `rounded-3xl` cu ring subtil; pe mobil
  imaginea se afișează mai mică, deasupra textului (stivuit).

## 2026-07-10 (6)

- Contact: pagina și formularul rescrise vizual — cele două blocuri (date de contact, formular)
  în carduri `rounded-2xl border` cu iconițe (`Phone`/`Mail`) lângă telefon/email, layout
  `lg:grid-cols-5` (2/3) în loc de 2 coloane egale.
- Header: `siteConfig.shortName` ("Seminarul Filadelfia") înlocuit cu `siteConfig.name`
  ("Seminarul Teologic Filadelfia") în `header.tsx` și `mobile-nav.tsx` — lipsea „Teologic”.
- `main-nav.tsx`: indicator vizual de pagină activă în meniul principal (nu doar culoarea
  textului) — underline (`after:`) sub itemul de nivel 1 activ, plus fundal + bold pe
  sub-itemul activ din dropdown; `aria-current="page"` adăugat pe ambele.

## 2026-07-10 (5)

- Absolvenți → Încheiere pregătire: text real (nu mai e placeholder) — Certificatul de
  absolvire acordat la finalul celor 2 ani de studiu.

## 2026-07-10 (4)

- Absolvenți → Promovabilitate: text real (nu mai e placeholder) — condițiile de promovare
  pe 2 ani de studiu, restanțe, echivalare note, promovare din oficiu.

## 2026-07-10 (3)

- Programa educațională: text real (nu mai e placeholder) — planul de învățământ pe 2 ani
  (29 discipline/an). Adăugat câmp nou `curriculum?: CurriculumRow[]` pe `ContentBlock`
  (`lib/content/types.ts`) și randare de tabel responsive (`overflow-x-auto`) în
  `content-page.tsx`, distinct de randarea pe paragrafe existentă.

## 2026-07-10 (2)

- Admitere → Documente: adăugat câmp `downloads?: DownloadableFile[]` pe `ContentBlock`
  (`lib/content/types.ts`) și randare dedicată în `content-page.tsx` (etichetă + buton
  „Descarcă fișier (.pdf)”, pattern `Button` + `render={<a href download />}` + `nativeButton={false}`).
  PDF-urile reale (`fisa-studentului.pdf`, `recomandare-pastorala.pdf`) puse în
  `public/documente/`, legate din `admitere.ts` (`documente`).

## 2026-07-10

- UI: lățime site mărită la `max-w-[90rem]` (header, hero, footer, sub-nav, page-header, paginile de
  conținut). Logo aplicat în header/footer (`public/logoheader.png`, `public/logofooter.png`),
  tunse cu `sharp` să elimine marginea transparentă din jurul iconiței.
- Organigrama de pe `/despre-noi/organizarea` refăcută ca tree HTML/CSS nativ (`org-chart.tsx`),
  înlocuind imaginea PNG veche.
- `content-page.tsx`: layout comun pentru paginile de conținut, cu detectare automată a titlurilor
  de secțiune scurte, a liniilor `Etichetă: text` și a intervalelor orare `HH:MM–HH:MM: text`
  (fiecare bold parțial/integral); prop `compact` pentru liste dense (grid 2 coloane, folosit la Crez).
- Text real (nu mai e placeholder) completat pentru toate cele 7 pagini din Despre Noi, toate cele 4
  din Studenți, și 3 din 4 din Admitere (Condiții, Evaluare, Criterii selecție).

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
