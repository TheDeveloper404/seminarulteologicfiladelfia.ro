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
