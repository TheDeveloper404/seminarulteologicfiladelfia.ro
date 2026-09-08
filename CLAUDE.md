@AGENTS.md

# Seminarul Teologic Filadelfia — Instrucțiuni de proiect

> **`CONTEXT.md`** (același director) conține domeniul: ce este site-ul, stack + deciziile
> arhitecturale cu motivele lor, structura codului, istoricul fazelor și al infrastructurii. NU se
> încarcă automat — citește-l când implementezi un flux nou sau ai nevoie de un „de ce". Aici rămân
> doar procesul, procedura de deploy, convențiile și verificarea.

Reconstruire greenfield a `seminarulteologicfiladelfia.ro` (era pe WordPress). Site instituțional
pentru Seminarul Teologic Filadelfia din Petroșani, parte din Biserica Filadelfia Petroșani.
Next.js 16 + Tailwind v4 + Postgres pe VPS OVHcloud. **Predat clientului (2026-08-20)** — singurul
punct deschis: poze + listă profesori (`src/lib/content/profesori.ts`), blocat pe user.

**Ține la zi `CHANGELOG.md`** — după fiecare modificare făcută în acest repo, adaugă o intrare
nouă (dată + ce s-a schimbat). E arhiva de referință a proiectului, nu doar note interne.

## Convenții rapide

Tipare mici, ca să nu mai fie nevoie de întrebări repetate pe lucruri banale:

- Când userul zice „citește poza"/„vezi screenshot-ul" fără cale: fișierele trimise ad-hoc în
  timpul unei sesiuni aterizează de obicei **direct în rădăcina repo-ului** (ex. `1.png`, `2.png`
  dintr-o sesiune anterioară — șterse după ce nu mai erau necesare). Verifică acolo întâi.
- Poze permanente de conținut (profesori etc.) merg în `public/images/profesori/`, nu în rădăcină.
- **`docs/`, `CHANGELOG.md` și `BACKLOG.md` sunt în `.gitignore`** (intenționat — documentație
  internă, nu urcă pe GitHub). De aceea `README.md` **nu** are secțiune „Documentație": link-urile
  către ele nu duc nicăieri pentru cineva care citește repo-ul de pe GitHub. Nu le re-adăuga.
  (Se scriu în continuare normal, local — doar nu se link-uiesc din README.)
- (Secțiune vie — se extinde pe măsură ce apar tipare noi confirmate, nu presupuneri.)

## Deploy — regulă obligatorie

**Regulă permanentă (2026-07-22): orice modificare terminată pe acest proiect se urmează AUTOMAT
de deploy pe VPS** (tar+scp, vezi `docs/deploy.md`), fără să aștepți o cerere separată „fă deploy".
Excepție: userul cere explicit doar o schimbare locală/draft, sau modificarea nu atinge nimic ce
rulează pe server (ex. doar `docs/` sau `CHANGELOG.md`). Un task nu e „gata" doar pentru că a fost
comis local — se termină după deploy confirmat pe domeniul real.

- **Site-ul rulează pe VPS OVHcloud (`57.131.141.84`, Ubuntu 24.04), NU pe Vercel.** Migrat de pe
  Hostinger 2026-08-18 (abonament anulat). Detalii complete de infrastructură: `docs/arhitectura.md`
  și `CONTEXT.md` §„Istoricul infrastructurii".
- **Important (audit infra 2026-07-21):** aplicația rulează pe VPS ca user dedicat `seminar` (NU
  root — hardening). pm2 e pornit sub `su - seminar -c '...'`. Orice comandă de deploy/pm2/npm pe
  server trebuie rulată ca `seminar`, altfel proprietarul fișierelor din `/var/www/app` (inclusiv
  `public/gallery/` și `uploads/`) se strică.
- **Deploy-uri pe VPS:** nu există pipeline automat — actualizarea codului se face manual prin
  tar+scp (vezi `docs/deploy.md`), apoi `npm run build` + `pm2 restart seminar-app`. De discutat cu
  userul dacă merită un script/CI simplu odată ce ritmul de modificări se stabilizează.

## Verificare

- `npm run build` după orice schimbare de tipuri/conținut — Tailwind v4 + Turbopack, type-check
  strict (nu te baza doar pe `npm run lint`).
- Pentru schimbări vizuale, verifică în browser (Playwright MCP disponibil) — homepage, o pagină
  de conținut cu sub-navigare, `/arhiva` (empty state), `/contact` (validare client), meniul mobil.
- **`HUMAN_RUNS_TESTS` activ** (`.claude/HUMAN_RUNS_TESTS` există) — userul rulează testele.
  Claude scrie/repară testele unitare și rulează `tsc --noEmit` / `lint` / `build`.
- **Nu există și nu se adaugă teste e2e automate (Playwright) — decizie explicită a userului,
  2026-07-28.** Fluxurile sunt puține și stabile; e2e-ul se face manual, în browser, de către user,
  după `docs/testare-manuala.md`. Aia e suita e2e a proiectului: **orice flux nou sau modificat se
  adaugă/actualizează acolo în aceeași sesiune**, iar la finalul unei schimbări indică explicit
  ce secțiuni trebuie parcurse. Nu propune instalarea Playwright pentru teste.
