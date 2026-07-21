# Audit de securitate — istoric

Consolidare a tuturor auditurilor/code review-urilor de securitate făcute pe acest proiect.
Pentru context complet pe fiecare rundă, vezi intrările corespunzătoare din `CHANGELOG.md`.

## Runda 1 — audit complet (13 categorii)

Prima trecere completă pe checklist-ul de 13 categorii (auth, autorizare, injecție, IDOR, upload,
rate limiting, etc.) pe tot portalul admin+student.

**Finding CRITIC găsit și reparat**: `getSession(role)` nu verifica rolul sesiunii alături de
validitatea token-ului — un student putea copia cookie-ul propriu (`student_session`) în slotul
de admin (`admin_session`) din DevTools și primea acces admin complet (bypass de autorizare prin
swap de cookie). Verificat live printr-un atac simulat, apoi reparat: `src/lib/auth/session.ts`
adaugă `eq(sessions.role, role)` explicit în query.

Findings minore: rate limiting lipsă pe unele fluxuri de login, sesiuni nu erau invalidate la
schimbarea parolei comune de student — ambele reparate.

**Verdict:** APPROVED după remediere.

## Runda 2 — audit complet, focus pe cod nou

A doua trecere, după implementarea galeriei foto și a câmpului `graduatedAt` editabil. Verificat
live (nu doar teoretic): path traversal pe `/gallery/` — respins (400/404), listare de directoare
— blocată (403).

**Finding LOW**: dead-code fallback în `slugify()` din `src/lib/gallery/actions.ts` (`|| String(year)`
niciodată fals pe un template string) — reparat.

CSP curățat: `img-src`/`media-src` nu mai permit `*.public.blob.vercel-storage.com` (Vercel Blob
abandonat).

**Verdict:** APPROVED, zero findings Critical/High/Medium.

## Runda 3 — audit de infrastructură (dincolo de cod)

Declanșată de întrebarea directă „ai verificat tot, nu sunt buguri, rute descoperite, headers
etc?" — verificări suplimentare, dincolo de cele două audituri de cod de mai sus:

- `npm audit`: 4 moderate, toate în `drizzle-kit`/esbuild (unealtă de dev, nu rulează în
  producție) — risc practic zero.
- Fișiere sensibile expuse public (`.env`, `.git/config`, `package.json`, SQL de migrare) —
  testate live, toate 404.
- `/api/materiale/[id]` fără sesiune — 401 corect.
- **SSH permitea login pe root cu parolă** (`sshd -T` confirma efectiv `permitrootlogin yes` +
  `passwordauthentication yes`) — reparat: `PermitRootLogin prohibit-password` +
  `PasswordAuthentication no`, login doar prin cheie.
- **fail2ban lipsea complet** — instalat, jail `sshd` activ (5 încercări/10min → ban 1h).

## Runda 4 — hardening suplimentar + workflow

- **Rate limiting mutat din memorie (Map) în Postgres** — nu se mai resetează la fiecare restart
  de deploy.
- **Aplicația mutată de pe `root` pe user dedicat `seminar`** — dacă ar fi compromisă, paguba
  rămâne izolată la `/var/www/app`.
- **Suită de teste automate** (vitest, 23 teste) pe logica critică — prima din proiect.
- **Dependabot** (update-uri dependențe, lunar, doar patch/minor automat) + **security alerts**
  activate separat pe repo (anunță CVE-uri imediat, nu așteaptă ciclul lunar).
- **CI** (`lint`+`test`+`build` pe fiecare push) + **CodeQL** (SAST, gratuit pe repo public,
  rulează pe push + săptămânal).
- **nginx**: `server_tokens off` — versiunea nginx nu mai e expusă la request-uri directe pe IP
  (bypass Cloudflare).
- **Kernel VPS actualizat** (reboot aplicat) — patch de securitate care era în așteptare.
- Confirmat: `unattended-upgrades` deja activ implicit pe imaginea Ubuntu (nimic de configurat).
- **Cloudflare Turnstile** pe login admin + student (`src/lib/turnstile.ts`,
  `src/components/turnstile-widget.tsx`) — verificare anti-bot, motivată de scanări automate
  deja observate în log-uri (probe-uri cu ID-uri false de Server Action). Cod implementat și
  gated pe env vars (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY`) — **activ din
  2026-07-21**, chei configurate pe VPS, verificat live (widget randat pe ambele login-uri).

## Risc rezidual, cunoscut și acceptat

- **Fără teste e2e** (Playwright) — doar teste unitare există azi. E2e rămâne responsabilitatea
  dezvoltatorului (`HUMAN_RUNS_TESTS`), nu s-a scris încă.
- **Fără pentest extern real** — doar review manual/agent-asistat, nu o firmă externă de
  securitate.
- **Fără monitorizare/alertare activă pe erori de aplicație** (ex. Sentry) — decizie conștientă a
  clientului (site instituțional simplu, volum mic de trafic/erori) — rămân doar log-urile pm2
  locale (cu rotație).
- Parolă comună pentru toți studenții (nu cont individual) — risc acceptat explicit de client încă
  din faza de decizie inițială (vezi
  `docs/decizie-infrastructura-si-functionalitati-noi.md`, secțiunea 7), fără date de plată reale
  procesate.
