# Seminarul Teologic Filadelfia — site + portal

Site instituțional public + portal admin/student pentru Seminarul Teologic Filadelfia din
Petroșani (parte din Biserica Filadelfia Petroșani). Next.js 16 (App Router), TypeScript strict,
Postgres. Rulează pe VPS propriu (Hostinger), nu pe Vercel.

## Stack

Next.js 16 · TypeScript strict · Tailwind CSS v4 · shadcn/ui (Base UI) · Postgres 16 + Drizzle
ORM · Maileroo (contact) · vitest (teste unitare).

## Pornire locală

```bash
npm install
cp .env.local.example .env.local   # completează DATABASE_URL + MAILEROO_API_KEY
npm run dev
```

## Documentație

- [`docs/arhitectura.md`](docs/arhitectura.md) — structură foldere, model de date, auth, galerie foto, infrastructură VPS
- [`docs/rute.md`](docs/rute.md) — toate rutele (public, admin, portal, API)
- [`docs/teste.md`](docs/teste.md) — ce acoperă suita de teste și cum se rulează
- [`docs/deploy.md`](docs/deploy.md) — procesul de deploy pe VPS, pas cu pas
- [`docs/workflow.md`](docs/workflow.md) — workflow de lucru, CI, CodeQL, Dependabot
- [`docs/audit-securitate.md`](docs/audit-securitate.md) — istoricul auditurilor de securitate
- [`docs/decizie-infrastructura-si-functionalitati-noi.md`](docs/decizie-infrastructura-si-functionalitati-noi.md) — decizia inițială de infrastructură + funcționalități noi
- [`CLAUDE.md`](CLAUDE.md) — handoff tehnic complet (sursa de adevăr pentru context/nuanțe)
- [`CHANGELOG.md`](CHANGELOG.md) — jurnal cronologic al tuturor modificărilor
