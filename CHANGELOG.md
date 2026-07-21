# Changelog

Arhivă a tuturor modificărilor aduse acestui proiect. Fiecare intrare: dată + ce s-a schimbat.
Nu e un changelog de release (nu există versiuni publicate încă) — e jurnalul de lucru al
proiectului, actualizat după fiecare set de modificări.

## 2026-07-21 (62)

**Code review + audit de securitate de închidere de sesiune** (agenți `security-engineer` +
`code-reviewer`, pe diff-ul necomis al zilei — vezi intrarea (61)).

- **Security: APPROVED**, 0 findings critice/înalte/medii. 2 findings LOW (defense-in-depth),
  ambele reparate: `updateGrade`/`deleteGrade` filtrau doar pe `gradeId`, nu verificau că nota
  aparține de fapt lui `studentId` (IDOR intra-rol — fără impact practic cu un singur cont admin,
  dar reparat oricum, `and(eq(grades.id, gradeId), eq(grades.studentId, studentId))`);
  `setAttendance` nu valida formatul `sessionDate` server-side — adăugat regex `YYYY-MM-DD`.
- **Code review: CHANGES REQUESTED → reparat.** Un bug real găsit (CR-001): cleanup-ul din
  `attendance-checkbox.tsx` (unmount cu scriere în zbor) decrementa contorul de pending al
  părintelui, dar blocul `finally` din `onChange` decrementa din nou necondiționat la rezolvarea
  promisiunii (neanulată de unmount) — contorul ajungea pe negativ, iar la următoarea scriere
  reală `hasPendingWrites` rămânea `false` din start, dezactivând silențios exact fix-ul de race
  condition din intrarea (61). Reparat: `finally` decrementează doar dacă `pendingRef.current`
  e încă `true` (nu a fost deja decrementat de cleanup). Plus 2 sugestii non-blocante aplicate:
  formularul de editare notă nu se închidea automat după salvare reușită (acum se închide via
  tranziția pending→not-pending fără eroare); ghilimele inconsistente (Unicode + entitate HTML
  amestecate) în mesajul de căutare fără rezultate.
- Verificat: `tsc --noEmit` + `npm run lint` curate, deploy + verificare live (curl 200).

## 2026-07-21 (61)

**Note/prezență admin (CRUD + fix bug real) + integrare prezență în pagina Studenți + profesori
reali + fix-uri vizuale mobil. Testat manual de user — platformă declarată production-ready.**

- **Note: editare + ștergere** — lipsea complet (doar adăugare exista). `updateGrade`/`deleteGrade`
  în `src/lib/grades/actions.ts`, UI inline (`grade-row.tsx`) cu editare pe loc + ștergere cu
  confirmare (`ConfirmDeleteDialog`), în `/admin/studenti/[id]/note`.
- **Fix bug real: bifa de prezență dispărea la schimbarea rapidă a datei.** Cauza (găsită prin
  citirea codului, nu ghicită): checkbox-ul trimitea scrierea în DB printr-un `fetch`
  neblocant (`startTransition` fără `await`); dacă adminul apăsa "Schimbă data" înainte să se
  termine scrierea, navigarea (full page load pe `<form method="get">`) anula request-ul în
  zbor — scrierea se pierdea silențios. Fix: `attendance-checkbox.tsx` face `await` pe scriere
  și anunță părintele printr-un contor de "pending"; cât timp există o scriere în curs, butonul
  de schimbare a datei e dezactivat.
- **Eliminată pagina separată `/admin/prezenta`, integrată complet în `/admin/studenti`** (decizie
  user: "pe pagina de prezență oricum faci doar prezența" + "aș vrea să fac prezența direct din
  pagina de studenți"). `/admin/studenti` are acum: selector "Data sesiunii de prezență" +
  checkbox "Prezent azi" per student + strip de istoric (ultimele 10 sesiuni, pătrățele stil
  "formă" de fotbal, verde/roșu, tooltip cu data) — toate la capătul din dreapta al tabelului.
  Data sesiunii se calculează automat ca prima zi a lunii curente dacă nu există `?data=` în URL
  — **nu trebuie schimbată manual în fiecare lună**, doar dacă adminul ține un link vechi cu
  `?data=` din altă lună. Dashboard admin + navigație actualizate (link "Prezență" eliminat).
- Container admin (`app-shell.tsx`, comun cu portalul studenților) lărgit `max-w-6xl` →
  `max-w-7xl` pentru coloanele noi din tabelul de studenți.
- Fix vizual: căutare + selector de dată pe `/admin/studenti` erau inconsistente (search cu
  `flex-1` se întindea pe containerul lărgit, selectorul de dată era într-un `Card` cu padding
  diferit) — uniformizate, fără `Card`, aliniate curat.
- **Curățare date de test**: șterse 3 rânduri din `attendance` create în timpul testării de azi
  (Miriam Băncilă, Belega Alexandra) — nu era bug de cod, doar date reziduale de test; istoricul
  pornește gol pentru toți studenții până marchează adminul prezența reală.
- **Fix mobil header**: numele complet "Seminarul Teologic Filadelfia" era vizibil pe mobil lângă
  siglă, împingând butonul Portal + hamburgerul aproape în afara ecranului. Ascuns sub `sm:`;
  butonul "Portal studenți" ascuns complet pe mobil (accesibil deja din hero) — rămân doar sigla
  + meniul hamburger.
- **Fix mobil footer**: textul "Școală teologică evanghelică protestantă conservatoare" avea
  `whitespace-nowrap`, mai lat decât viewport-ul mobil → tăiat/scroll orizontal. Eliminat
  `nowrap`-ul (poate face wrap), separatorii "|" ascunși pe mobil, text centrat.
- **Profesori reali**: adăugați Prof. Daniel Nemeș (Directorul Seminarului), Prof. Ionel Grecu
  (Pastor Biserica Filadelfia Horezu), Prof. Claudiu Valer Todeciu — poze în
  `public/images/profesori/` (înlocuite ulterior cu variante de rezoluție mai mare, 800×534,
  primite de la user — cele inițiale erau doar 337×225, sursa blurului semnalat). Adăugați și
  Dani Bulancea (Secretarul Seminarului, fără prefix "Prof."), Prof. Larisa Bulancea, Prof. Florin
  Dontu — fără poză/rol încă (`bio`/`role` opționale acum în `StaffMember`, `types.ts`).
- **Layout organigramă pe `/profesori`**: câmp nou `tier?: 1 | 2 | 3` pe `StaffMember` — nivel 1
  (Daniel Nemeș) sus, izolat; nivel 2 (Dani Bulancea, Larisa Bulancea, Claudiu Todeciu) sub el;
  nivel 3 (Ionel Grecu, Florin Dontu) mai jos, centrat ca grup de 2 (nu într-o grilă de 3 coloane
  cu gol).
- Verificare: `tsc --noEmit` + `npm run lint` curate după fiecare pas; deploy manual (tar+scp,
  `docs/deploy.md`) pe VPS după fiecare set de modificări, verificat live (curl 200) de fiecare
  dată. **Testat manual complet de user** — confirmă că totul funcționează.
- **Status: platformă considerată 100% production-ready** — singurul item rămas neschimbat e
  informativ (fără poză/disciplină pentru 3 profesori, în așteptarea materialului de la Seminar),
  nu blochează livrarea.

## 2026-07-21 (60)

- **Fix: logo din header "sărea" stânga/dreapta la anumite meniuri** — cauza: fără `scrollbar-
  gutter: stable` pe `html`, orice overlay (dropdown Base UI, dialog) care blochează scroll-ul
  paginii face scrollbar-ul vertical să dispară temporar; lățimea disponibilă crește cu ~15px,
  iar header-ul centrat (`mx-auto`) se recalculează. Fix dintr-o linie în `globals.css`, rezolvă
  toată clasa de bug, nu doar meniul raportat. Verificat live (`scrollbarGutter: stable`
  confirmat pe `seminarulteologicfiladelfia.ro`).
- **Fix: imaginea din hero se simțea "enervantă" la refresh** — încărcarea era rapidă (0-150ms,
  din cache CDN, verificat cu `performance.getEntriesByType`), dar swap-ul blur→clar era instant,
  suprapus cu animația de fade-in a paginii (`page-enter`) — senzație de "pop" vizual. Fix:
  `hero.tsx` (acum client component) adaugă `onLoad` + fade CSS (`opacity-0` → `opacity-70` pe
  700ms) la încărcarea imaginii, în loc de swap brusc.
- **Verificat (fără fix necesar): rate limiting login student.** Confirmat în cod
  (`src/lib/rate-limit.ts` + `student-actions.ts`): 5 încercări per IP la fiecare fereastră de
  15 minute (nu o limită orară fixă — fereastra se resetează per IP de la prima încercare nouă
  după expirare). Admin: 10/15min. Deja documentat/acceptat ca risc rezidual în auditul de
  securitate anterior (ocolibil prin rotație de IP, barieră reală fiind parola comună de student).

## 2026-07-21 (59)

- **Fix: Turnstile eșua uneori la primul submit** (raportat de user: login admin cu date corecte
  → „verificarea antibot nu a reușit", funcționa abia după refresh). Cauza: widget-ul se
  randează asincron (`<Script async defer>` + challenge rulat de Cloudflare pe rețea), dar
  butonul de submit nu aștepta token-ul — dacă userul completa formularul și dădea submit
  înainte ca widget-ul să termine, `cf-turnstile-response` era gol, serverul respingea corect
  (nu era o breșă), dar cu un mesaj confuz pentru un login altfel valid. Fix (verificat cu docs
  oficiale Cloudflare, `client-side-rendering`): `TurnstileWidget` primește acum `onReadyChange`,
  înregistrat prin `data-callback`/`data-expired-callback`/`data-error-callback` (nume globale
  unice per instanță, via `useId()`); ambele formulare de login (`admin/login/login-form.tsx`,
  `portal/login/login-form.tsx`) dezactivează submit-ul („Se verifică...") până la primul token
  valid. Verificat: `tsc`/`lint`/`test`/`build` curate local, deploy live, buton confirmat
  funcțional pe `seminarulteologicfiladelfia.ro/admin/login`.

## 2026-07-21 (58)

- **Documentat (nu configurat acum — deja activ, doar nescris până azi): backup VPS.** Userul
  are snapshot **săptămânal** al întregului server activat din panoul Hostinger (opțiune nativă
  pe planul KVM1, zilnic/săptămânal/lunar disponibile). Nu era menționat nicăieri în
  `CHANGELOG.md`/`docs/` — a dus la un fals-pozitiv azi (am semnalat lipsa de backup ca gol de
  producție, verificând doar CHANGELOG/docs/memorie, fără să știu că exista deja). Notat acum în
  `docs/arhitectura.md`, secțiunea Infrastructură (VPS), ca să nu se mai piardă informația.

## 2026-07-21 (57)

- **Verificare targetată de securitate** pe rutele care servesc fișiere (materiale de curs,
  galerie foto) + toate Server Actions din portal — la cererea userului, alternativă mai ieftină
  la un audit complet de 13 categorii (majoritatea deja acoperite de runda de hardening din
  aceeași zi, vezi (53)-(55)). Verificat: `/api/materiale/[id]` (auth check înainte de orice,
  numele fișierului de pe disc vine mereu din DB — UUID generat, niciodată din inputul
  utilizatorului, deci fără path traversal; `Content-Disposition` cu `encodeURIComponent`
  previne header injection), storage-ul de galerie (extensii permise, nume de fișier
  UUID-generate), și fiecare fișier `actions.ts` din `src/lib/*` — toate Server Actions
  sensibile apelează `requireAdmin()`/`requireStudent()` explicit în interior (necesar, pentru
  că un Server Action e apelabil direct prin POST, independent de layout-ul care protejează
  pagina). Sesiuni (`src/lib/auth/session.ts`): token random 32 bytes, stocat hash-uit (SHA256,
  niciodată în clar), expirare verificată server-side. Niciun risc găsit pe zonele astea.
  **Un singur finding real, minor:** `robots.txt` (`src/app/robots.ts`) permitea indexarea
  `/admin` și `/portal` — paginile redirectează spre login fără date scurse, dar structura
  internă (`/admin/studenti`, `/portal/note` etc.) putea apărea în rezultate Google. Fix:
  `disallow: ["/admin", "/portal"]` în `robots.ts`, un singur loc, acoperă tot arborele
  (prezent + viitor), mai curat decât `noindex` per-pagină pe cele ~13 pagini care nu-l aveau.

## 2026-07-21 (56)

- **Fix: footer "ridicat", spațiu alb sub el pe paginile cu conținut puțin** (ex.
  `/studenti/vizitatori`) — cauza era `src/app/template.tsx` (rulează la fiecare navigare,
  animația de fade-in a paginii), care înfășoară conținutul într-un `<div class="page-enter">`
  chiar sub `<body>`. `body` e `flex flex-col`, dar acel div era `display:block` fără
  `flex-1` — nu se mai întindea să umple restul înălțimii disponibile, deci footer-ul (care
  altfel e împins corect la capăt via `min-h-full`/`flex-1` în `(site)/layout.tsx`) rămânea
  "suspendat" mai sus decât capătul real al paginii. Bonus: comentariul din `template.tsx`
  spunea explicit "Header/Footer nu sunt afectate [de animație]" — fals, fiindcă fișierul stă
  la `src/app/` (deasupra lui `(site)/layout.tsx`), deci Header+Footer erau de fapt înfășurate
  și ele, nu doar conținutul paginii. Fix minim, în `src/app/globals.css`: clasa `.page-enter`
  primește `display:flex; flex-direction:column; flex:1 1 auto` — participă corect în lanțul
  flex al lui `body`, indiferent de pagină. Verificat vizual (Playwright, computed styles +
  screenshot) pe o pagină scurtă și pe homepage (mult conținut) — niciun regres.

## 2026-07-21 (55)

- **Fix CI, care pica pe GitHub** (`npm ci` → `npm install` în `.github/workflows/ci.yml`) —
  greșeală proprie: workflow-ul fusese scris și "verificat" doar local, fără să confirm efectiv
  o rulare reușită pe GitHub Actions. `npm ci` e strict la potrivirea exactă cu versiunea de npm
  care a generat lockfile-ul; mașina de dev are npm 11.10.1 upgradat manual, diferit de npm-ul
  cu care vine Node 22 curat pe runner. `npm install` evită dependența asta. Nu verificat încă
  live pe GitHub (necesită push, pe care îl face userul).

## 2026-07-21 (54)

- **Cloudflare Turnstile activat live** pe login admin + student — cheile configurate în
  `.env.local` pe VPS, rebuild + restart, verificat live (widget randat cu site key-ul corect pe
  ambele pagini de login). Plus, activat manual în dashboard Cloudflare: SSL/TLS Full (Strict),
  Always Use HTTPS, Minimum TLS Version 1.2, Bot Fight Mode.

## 2026-07-21 (53)

- **CI** (`.github/workflows/ci.yml`) — lint + test + build pe fiecare push/PR către `main`.
- **CodeQL** (`.github/workflows/codeql.yml`) — SAST gratuit (repo public), pe push/PR + lunea
  03:00 UTC.
- **Dependabot security alerts** activate pe repo (separat de update-urile lunare din
  `dependabot.yml`) — anunță CVE-uri cunoscute imediat, nu așteaptă ciclul lunar. Ecosistemul
  `github-actions` repus în `dependabot.yml` (acum există workflow-uri reale de verificat).
- **`docs/audit-securitate.md`** — consolidare a tuturor rundelor de audit/hardening de până
  acum (4 runde), plus riscul rezidual cunoscut și acceptat.
- **VPS**: `server_tokens off` în nginx (versiunea nu mai e expusă la request-uri directe pe IP,
  bypass Cloudflare) · kernel actualizat + reboot aplicat (patch de securitate care era în
  așteptare de la instalarea inițială) · confirmat `unattended-upgrades` deja activ implicit.
- **Cloudflare Turnstile pe login admin + student** (`src/lib/turnstile.ts`,
  `src/components/turnstile-widget.tsx`) — verificare anti-bot server-side în
  `admin-actions.ts`/`student-actions.ts`, motivată de scanări automate deja observate în
  log-uri. CSP extins (`script-src`/`connect-src`/`frame-src` → `challenges.cloudflare.com`).
  Cod gated pe env vars — **inactiv până cheile sunt configurate pe VPS** (fără ele, login
  funcționează normal, doar fără protecția anti-bot). 4 teste noi (`turnstile.test.ts`).

## 2026-07-21 (52)

- **`README.md` rescris ca fișier de prezentare** (era încă boilerplate-ul default de
  `create-next-app` — Vercel, Geist font, nimic real din proiect) — acum: descriere scurtă,
  stack, pornire locală, index de link-uri către documentația detaliată.
- **Documentație detaliată separată în `docs/`** (prima încercare o îngrămădise greșit în
  README, corectat imediat): `arhitectura.md` (structură foldere, model de date, auth, galerie
  foto, infrastructură VPS), `rute.md` (toate rutele — public/admin/portal/API), `teste.md` (ce
  acoperă suita vitest + split unit/e2e), `deploy.md` (proces manual pas cu pas), `workflow.md`
  (ciclul unei modificări, Dependabot, merge după PR-uri de Dependabot).

## 2026-07-21 (51)

- **Suită de teste automate (vitest, prima din proiect)** — 23 teste unitare pe logica critică:
  `hashToken` (sesiune, determinist + niciodată token-ul brut), alfabetul/generarea ID-urilor
  publice de student (fără caractere ambigue 0/O/1/I/L), `slugify` galerie (diacritice, fallback
  pe an gol), schema Zod a formularului de contact (honeypot, validare email/mesaj/nume),
  `isRateLimited` (prag de decizie, limită custom). Câteva funcții mutate din fișiere `"use
  server"` în fișiere separate (`src/lib/gallery/slugify.ts`, `src/lib/contact/schema.ts`) —
  Next.js interzice exporturi non-async dintr-un fișier Server Action, nu se putea testa altfel
  fără să spargă build-ul. `npm run test` rulează local (vitest) — vezi split
  unit-eu/e2e-userul din CLAUDE.md.
- **Rate limiting mutat din memorie (Map) în Postgres** (`rate_limit_attempts`, migrare
  `drizzle/0006`) — limita nu se mai resetează la fiecare `pm2 restart`/deploy. Upsert atomic
  într-un singur round-trip (`ON CONFLICT ... DO UPDATE` cu `CASE` pe fereastra expirată),
  sigur la request-uri concurente.
- **Aplicația mutată de pe `root` pe un user dedicat, fără privilegii (`seminar`)** pe VPS —
  hardening: dacă aplicația ar fi vreodată compromisă, paguba rămâne izolată la
  `/var/www/app`, nu se extinde la tot serverul. `pm2` rulează acum sub `seminar`
  (`pm2-seminar.service`, autostart la reboot), vechiul serviciu `pm2-root` dezactivat.
  **Important pentru deploy-uri viitoare**: comenzile `npm`/`pm2` trebuie rulate ca `seminar`
  (`su - seminar -c '...'`), nu ca root — altfel se strică proprietarul fișierelor din
  `public/gallery/` și `uploads/`.
- **`pm2-logrotate` instalat** — log-urile aplicației nu mai cresc nelimitat.
- **Dependabot configurat** (`.github/dependabot.yml`) — verificare lunară a dependințelor npm
  și GitHub Actions; doar update-uri patch/minor ajung automat în PR (major e ignorat aici,
  verificat manual când chiar e nevoie, ca să nu vină breaking changes nesupravegheate).

## 2026-07-21 (50)

- **Audit de infrastructură + hardening VPS**, ca urmare a unei verificări suplimentare (dincolo
  de cele două audituri de cod din (41) și (49)) — cerută explicit după întrebarea „ai verificat
  tot, nu sunt buguri, rute descoperite, headers etc?". Găsiri reale, remediate:
  - **SSH permitea login pe root cu parolă** (`sshd -T` confirma efectiv `permitrootlogin yes` +
    `passwordauthentication yes`, deși un fișier de la cloud-init sugera altceva — ambiguitate
    cauzată de ordinea de includere `/etc/ssh/sshd_config.d/*.conf`, unde primul fișier găsit
    alfabetic câștigă). Fixat: `/etc/ssh/sshd_config.d/00-hardening.conf` nou, cu
    `PermitRootLogin prohibit-password` + `PasswordAuthentication no` — login SSH doar prin
    cheie, verificat live (conexiune nouă prin cheie funcționează, login prin parolă e respins
    cu „Permission denied (publickey)").
  - **fail2ban instalat și activat** (nu exista deloc) — jail `sshd` (backend systemd): 5
    încercări greșite / 10 minute → ban 1 oră.
  - Verificări suplimentare fără găsiri: `npm audit` (4 moderate, toate în `drizzle-kit`/esbuild,
    unealtă de dev, nu rulează în producție — risc practic zero), fișiere sensibile expuse public
    (`.env`, `.git/config`, `package.json`, SQL de migrare — toate 404), `/api/materiale/[id]`
    fără sesiune (401 corect).
  - **Netratat, documentat pentru mai târziu**: procesul Node (pm2) rulează ca user `root` pe VPS
    — ar trebui mutat pe un user dedicat, fără privilegii (schimbare cu atingere mai mare:
    permisiuni fișiere, acces Postgres, config pm2). Reboot VPS pending (kernel actualizat,
    neaplicat încă) — netratat, nu urgent.

## 2026-07-21 (49)

- **Code review + audit de securitate complet pe toată aplicația** (al doilea, după cel din (41);
  de data asta cu focus pe cod nou de atunci: galerie foto, `graduatedAt` editabil, config nginx).
  Verdict: **APPROVED**, zero findings Critical/High/Medium. Verificat direct pe live (nu doar
  teoretic): path traversal pe `/gallery/` — respins (400/404), listare de directoare — blocată
  (403). Un singur finding LOW (dead-code fallback în `slugify()` din
  `src/lib/gallery/actions.ts`, reparat).
  - CSP curățat: `img-src`/`media-src` nu mai permit `*.public.blob.vercel-storage.com`
    (Vercel Blob abandonat, galeria e same-origin acum) — `images.remotePatterns` din
    `next.config.ts` eliminat, nefolosit nicăieri în cod.

## 2026-07-21 (48)

- `public/gallery/` adăugat în `.gitignore` — poze de galerie trăiesc doar pe VPS, nu în repo.
- **Paginile portal student centrate** (Note, Prezență, Materiale, dashboard) — aveau `max-w-*`
  fără `mx-auto`, aceeași problemă reparată deja pe partea de admin.
- **Albumele „Absolvire 2018" și „Cursuri 2018" unite** într-un singur album „Seminar 2018" (16
  poze) — mutare la nivel de DB, fișierele fizice erau deja în același folder de an, fără
  coliziuni de nume.
- **Data absolvirii, editabilă manual** pe pagina de editare student — înainte, bifarea
  „Absolvent" seta mereu `graduatedAt = azi`, fără posibilitate de corecție pentru absolvenți din
  trecut. Acum admin poate introduce orice dată; câmpul e prepopulat cu data curentă la prima
  bifare, dar rămâne editabil oricând după.

## 2026-07-21 (47)

- **Galerie foto — implementată complet** (Faza 3, era ON HOLD). Doar poze, fără video (decizie
  explicită a userului — elimină complet `MediaItem`/`GalleryAlbum` din `src/lib/content/types.ts`,
  vechiul sistem static bazat pe Vercel Blob).
  - Schimbare de schemă: `gallery_albums`, `gallery_photos` (migrația `drizzle/0005_happy_franklin_richards.sql`).
  - Poze stocate în `public/gallery/<an>/` pe VPS, nume aleator (UUID), nu numele original.
  - Panou admin nou `/admin/galerie` — creează/șterge album, încarcă poze multiple dintr-o
    singură selecție (auto-submit, ca la materiale de curs), șterge poză individual (hover,
    dialog propriu de confirmare, nu `window.confirm`).
  - **Bug real prins și reparat înainte de livrare**: Next.js (`next start`) nu servește fișiere
    adăugate în `public/` DUPĂ ultimul build — o poză încărcată de admin la runtime rămânea 404
    până la un rebuild manual. Fix: nginx servește `/gallery/` direct din disc
    (`location /gallery/ { alias .../public/gallery/; }`, înaintea proxy-ului către Next), iar
    componentele publice (`GalleryCard`, `Lightbox`) și cele din admin folosesc `<img>` simplu în
    loc de `next/image`, ca să nu depindă deloc de manifestul de build al Next. Testat live:
    poză încărcată din admin, servită 200 imediat, fără rebuild.
  - Populate 6 albume reale din poze furnizate de user: Absolvire 2013 (6), Absolvire 2014 (5),
    Seminar 2016 (6), Absolvire 2018 (5), Cursuri 2018 (11), Seminar 2025 (4) — 37 poze total.
  - Paginile publice `/arhiva` și `/arhiva/[slug]` rescrise să citească din Postgres (`force-dynamic`,
    nu mai pot fi statice ca înainte — depind de DB la fiecare request).
  - Label-uri actualizate „Arhiva foto/video" → „Arhiva foto" (site-config.ts, meniu).

## 2026-07-21 (46)

- **Sortare pe coloane (Nume, An înscriere, An studiu)** în tabelele Studenți, Prezență și
  Absolvenți — componentă nouă reutilizabilă `src/components/app-shell/sortable-header.tsx`
  (click pe antet, indicator de direcție). Prezența și Absolvenții au primit și coloana „An
  studiu" care le lipsea. Extrase în componente client dedicate: `attendance-table.tsx`,
  `graduates-table.tsx` (Studenți era deja client).
- **Rescrise, centrate ca restul paginilor**: `/admin/studenti/[id]/note` (formular într-un Card,
  `PageHeader`), `/admin/studenti/[id]` (editare) și `/admin/studenti/nou` (adăugare) — foloseau
  `max-w-lg` fără `mx-auto`, lipite de marginea din stânga în loc să fie centrate.

## 2026-07-21 (45)

- **Toggle vizibilitate parolă** (iconiță ochi) pe ambele formulare de login — componentă nouă
  reutilizabilă `src/components/ui/password-input.tsx`, buton accesibil din tastatură (focus
  vizibil, `aria-label`/`aria-pressed`), folosită în `src/app/admin/login/login-form.tsx` și
  `src/app/portal/login/login-form.tsx`.

## 2026-07-21 (44)

- **Câmp nou „An de studiu" (Anul I / Anul II)** pe student — migrație `drizzle/0004_fearless_lake.sql`
  (`students.study_year integer default 1`), editabil din formularul admin, afișat în tabelul de
  Studenți. Actualizat manual de admin (nu există calendar academic din care platforma să deducă
  automat trecerea între ani).
- **Populați cei 19 studenți reali ai Seminarului** (din evidența pe hârtie a userului): 6 activi
  Anul I (înscriși septembrie 2025), 13 marcați direct Absolvent (Anul II, înscriși septembrie
  2024) — trecuți automat în arhivă, fără acces la portal (comportament din CHANGELOG 43).
  ID-uri publice generate cu același generator folosit de aplicație (alfabet fără caractere
  ambigue). Date introduse direct în DB de producție (echivalent cu „admin rulează SQL manual",
  convenția proiectului) — nu există încă un flow de bulk-import în UI.

## 2026-07-21 (43)

- **Studenții absolvenți nu mai au acces la portal**: `loginStudent` (`src/lib/auth/student-actions.ts`)
  respinge autentificarea cu mesaj explicit dacă `student.graduated`. `updateStudent`
  (`src/lib/students/actions.ts`) taie imediat orice sesiune de portal deja activă în momentul
  marcării ca „Absolvent" (nu mai așteaptă expirarea de 7 zile a cookie-ului). Testat end-to-end
  live: login înainte de absolvire → funcționează; marcare Absolvent din admin → sesiunea activă
  dispare din DB; retry login → blocat cu mesajul corect.

## 2026-07-21 (42)

- **Reparate cele 2 findings MEDIUM/LOW rămase din auditul de securitate (41)**:
  - Rate limiting pe login studenți întărit de la 10/15min (default) la 5/15min per IP —
    `isRateLimited()` din `src/lib/rate-limit.ts` acceptă acum `maxAttempts` opțional per apel,
    nu doar o constantă globală.
  - `scripts/set-shared-password.ts` include acum și `DELETE FROM sessions WHERE role =
    'student';` în SQL-ul generat — schimbarea parolei comune invalidează automat toate sesiunile
    de student deja emise (înainte rămâneau valabile până la 7 zile, indiferent de schimbare).

## 2026-07-21 (41)

- **Audit de securitate complet (13 categorii)** pe autentificare, server actions, rută API,
  upload fișiere, config. Un finding CRITICAL, reparat imediat și redeploy-uit (era live):
  `getSession(role)` din `src/lib/auth/session.ts` nu verifica dacă rolul stocat în DB pentru
  sesiune (`sessions.role`) se potrivea cu rolul cerut ("admin" vs "student") — doar validitatea
  tokenului. Un student autentificat (posibil doar cu parola comună) putea copia manual valoarea
  cookie-ului `student_session` în slotul `admin_session` din DevTools și obținea acces complet la
  panoul de admin (bypass total de autorizare). Fix: filtru `eq(sessions.role, role)` adăugat în
  query. Verificat pe live prin simulare directă a atacului (Playwright, cookie swap) — confirmat
  blocat după fix.
  - Alte 2 findings, neblocante: rate limiting per-IP pe login student e ocolibil prin rotație de
    IP (singura barieră reală fiind parola comună) — MEDIUM, recomandare de strictețe mai mare,
    nu implementat încă; schimbarea parolei comune nu invalidează sesiunile deja emise (rămân
    valabile până la 7 zile) — LOW, necesită pas manual (`DELETE FROM sessions WHERE
    role='student'`) dacă se dorește tăiere imediată a accesului.

## 2026-07-21 (40)

- **Contact: migrat de la EmailJS la Maileroo (server-side)** — decizie luată în aceeași sesiune,
  după ce EmailJS s-a dovedit nesatisfăcător pe plan gratuit (fără restricție de domeniu pe cheia
  publică, expusă complet în browser). Resend a fost respins la rândul lui (plan free al userului
  deja ocupat cu 1 domeniu, pe alt proiect). Ales Maileroo: 3 domenii + 3000 emailuri/lună gratuit.
  - Trimiterea mutată complet server-side: Server Action (`src/lib/contact/actions.ts`), nu mai
    există niciun apel client-side către un API extern — `connect-src` din CSP restrâns înapoi la
    `'self'` (`next.config.ts`).
  - Validare Zod server-side (dublează validarea nativă HTML5 din formular — client-side nu mai e
    de încredere, cum era cazul cu EmailJS unde tot trimiterea era client-side).
  - Rate limiting pe IP reutilizat de la login (`src/lib/rate-limit.ts`, mutat din
    `src/lib/auth/` — nu mai e specific auth, folosit acum și de formularul de contact).
  - Domeniu `seminarulteologicfiladelfia.ro` verificat în Maileroo (SPF/DKIM/DMARC prin Cloudflare
    DNS) — emailurile pleacă de la `contact@seminarulteologicfiladelfia.ro`, cu Reply-To pe
    emailul vizitatorului, către `seminar.filadelfia@gmail.com`. Template HTML propriu (inline
    styles, cross-client).
  - `react-hook-form` + `@hookform/resolvers` + `@emailjs/browser` dezinstalate (nemaifolosite).
  - Testat live: trimitere reală confirmată; primul email a intrat în Spam (normal — domeniu nou,
    fără istoric de trimitere), rezolvat de user cu „Not spam" în Gmail, al doilea test a intrat
    direct în Inbox.
  - `MAILEROO_API_KEY` (server-only, fără `NEXT_PUBLIC_`) în `.env.local` pe VPS.

## 2026-07-21 (39)

- **Contact live (EmailJS) — COMPLET**: cont EmailJS (folosit de user și pentru
  filadelfia-petrosani.ro, același Public Key — corect, e legat de cont nu de site), serviciu
  Gmail conectat pe `seminar.filadelfia@gmail.com` (`service_swpmc7h`), template HTML propriu
  (`template_57mdpkq`, cod scris de la zero — design editor-ul EmailJS are compatibilitate slabă
  cross-client). Cele 3 chei setate în `.env.local` pe VPS, rebuild (obligatoriu — `NEXT_PUBLIC_*`
  se inlinează la build time, nu e suficient un restart pm2). Testat live: trimitere reală prin
  formularul de pe `/contact`, confirmată. Restricția de domenii EmailJS nu e disponibilă pe plan
  free — rămâne nerestricționată, risc deja acceptat explicit de user (vezi
  [[feedback_emailjs_decision]] și nota din CLAUDE.md).

## 2026-07-21 (38)

- **Iterație UI/UX admin + portal, pe feedback direct al userului, pe live**: sidebar de
  navigație fix în stânga (înlocuiește bara orizontală de sus) cu iconițe și stare activă,
  aplicat în `src/components/app-shell/` (`AppShell`, `AppShellSidebarNav`, `AppShellTopNav`
  pentru mobil). A necesitat trecerea iconițelor ca JSX pre-randat din layout-urile server către
  componenta client de nav — trimiterea referinței de componentă (funcție) direct producea 500
  ("Functions cannot be passed directly to Client Components").
- Text mărit global pe admin+portal (sidebar, titluri, tabele, formulare, empty states) — input-
  urile shadcn au `md:text-sm` implicit pe desktop, suprascris explicit cu `md:text-base` unde
  era nevoie de citire mai ușoară pe laptop.
- **Bug real reparat**: căsuțele de prezență (`AttendanceCheckbox`) nu aveau `key` legat de dată
  — la schimbarea datei sesiunii, React refolosea aceleași noduri DOM necontrolate
  (`defaultChecked`), păstrând bifa vizuală veche în loc s-o ia din baza de date. Fix:
  `key={sessionDate}` forțează remount.
- Upload material de curs: din două acțiuni separate (alege fișier + apasă submit) într-una
  singură — un buton „Alege și încarcă material" deschide direct dialogul de fișier, iar la
  selecție se autocompletează titlul din numele fișierului și se trimite automat formularul.
- Ștergere pentru studenți și materiale de curs (cu fișierul de pe disc), confirmare printr-un
  dialog propriu al aplicației (Base UI `Dialog`), nu `window.confirm` nativ.
  `client_max_body_size 50M` adăugat în nginx (lipsea, bloca orice upload peste 1MB cu 413).
- Studenții marcați „Absolvent" nu mai apar în lista principală de Studenți (doar în Arhivă
  absolvenți); arhiva e acum grupată pe anul absolvirii, nu toți la grămadă.
- Search live după nume în lista de studenți; email/telefon complet opționale la adăugare (nu se
  mai cere cel puțin un contact); pagina de Materiale reorganizată pe două coloane (formular
  stânga, listă dreapta, înălțimi egale); lățimi de conținut uniformizate pe toate paginile
  (tabelele nu mai sunt întinse artificial cu goluri mari între coloane scurte).

## 2026-07-21 (37)

- **Deploy live pe VPS Hostinger KVM1** (`31.97.47.182`, Ubuntu 24.04, Frankfurt) — Vercel
  abandonat definitiv pentru acest proiect. Stack instalat: Postgres 16 (user dedicat
  `seminar_app`, ascultă doar pe localhost), Node 22, nginx (reverse proxy), `pm2` (auto-start la
  reboot), `ufw` (doar 22/80/443 deschise). Cele 4 migrații din `drizzle/*.sql` rulate pe DB-ul de
  producție, cont admin + parolă comună de student create prin `scripts/create-admin.ts` /
  `scripts/set-shared-password.ts` (SQL generat, rulat manual, ca de obicei).
- **Domeniu + HTTPS**: `seminarulteologicfiladelfia.ro` conectat prin Cloudflare (nameserver mutate
  de la Hosterion), A records `@`/`www` → IP VPS, proxy Cloudflare activ. Certificat Let's Encrypt
  instalat pe VPS via certbot (auto-reînnoire prin systemd timer), nginx redirectează HTTP→HTTPS.
  Verificat cu userul: domeniul nu avea MX configurat înainte de migrare, deci niciun risc de a
  pierde email.
- **Refactor UI/UX admin + portal student**: paginile publice mutate în route-group `(site)`
  (`src/app/(site)/`) cu propriul `layout.tsx` (Header+Footer) — `/admin` și `/portal` nu mai
  moștenesc chrome-ul site-ului public. Componente noi reutilizabile în
  `src/components/app-shell/` (`AppShell`, `AppShellNav` cu stare activă, `PageHeader`,
  `EmptyState`). Dashboard-urile `/admin` și `/portal` afișează acum statistici reale (nr. studenți
  activi/absolvenți/materiale) în loc de text placeholder. Empty states reale (icon + titlu +
  descriere + CTA) pe studenți, materiale, absolvenți, prezență — înainte erau o singură
  propoziție gri fără cadru. `layout.tsx` rădăcină simplificat la doar `html`/`body`/fonturi.
  Build + lint + type-check verificate curat.

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
