# Deploy

**Manual, fără CI/CD** — nu există pipeline automat de deploy (deploy-ul pe VPS e o decizie
conștientă, nu o lipsă temporară).

## Flux

```bash
# local — include next.config.ts! (ușor de uitat, dar fără el schimbările din CSP/headers/
# experimental nu ajung pe server, deși build-ul reușește "normal" cu config-ul vechi)
tar czf deploy.tar.gz src drizzle next.config.ts package.json package-lock.json

# pe VPS, ca user "seminar" (NU root)
scp deploy.tar.gz seminar@<vps>:/var/www/app/
ssh seminar@<vps>
cd /var/www/app && tar xzf deploy.tar.gz
npm install && npm run build
pm2 restart seminar-app
```

## Schimbări de schemă DB

Dacă schema s-a schimbat: `npx drizzle-kit generate` local → copiază SQL-ul generat pe VPS →
aplică manual (`psql -d seminar -f drizzle/00XX_....sql`) **înainte** de restart. Niciodată
`drizzle-kit push` direct pe producție.

## Variabile de mediu

`.env.local` pe VPS, niciodată în git (vezi `.env.local.example`): `DATABASE_URL`,
`MAILEROO_API_KEY`. Opțional (dar recomandat): `NEXT_PUBLIC_TURNSTILE_SITE_KEY` +
`TURNSTILE_SECRET_KEY` — fără ele, login-ul admin/student funcționează normal, doar fără
protecția anti-bot Turnstile (vezi `docs/audit-securitate.md`).

## Infrastructură

Vezi [`arhitectura.md`](arhitectura.md#infrastructură-vps) pentru detalii despre VPS, nginx,
Postgres, SSH/fail2ban.
