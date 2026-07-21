# Arhitectură

## Structură foldere

```
src/app/(site)/          pagini publice — Header/Footer comune, conținut din src/lib/content/*.ts
src/app/admin/(protected) portal admin — app-shell propriu (fără header/footer public), auth cookie
src/app/portal/(protected) portal student — idem, app-shell separat
src/app/api/materiale/[id] singura rută API — download material protejat prin sesiune
src/db/schema.ts          schema Postgres completă (Drizzle)
src/lib/auth/             sesiuni (cookie httpOnly, hash sha256 în DB), login admin + student
src/lib/rate-limit.ts     rate limiting persistent (Postgres), folosit pe login + contact
src/lib/gallery/          storage (fișiere pe disc) + Server Actions admin pt. galerie foto
src/lib/students/         CRUD studenți, generare ID public (6 caractere, fără ambiguități)
src/lib/content/          conținut static tipizat (Despre Noi, Admitere, Programa etc.) — editat
                           direct prin commit, nu prin admin UI
src/components/app-shell/ nav + layout comun pentru admin și portal (sidebar, nu header clasic)
drizzle/                  migrări SQL generate (never edited by hand)
docs/                     documente de decizie/analiză (nu doar note interne — merg în repo)
```

## Model de date (Postgres, vezi `src/db/schema.ts`)

`admins`, `students` (cu `public_id` generat aleator — nu secvențial, nu CNP — și `study_year`
1/2 + `graduated`/`graduated_at`), `sessions` (cookie httpOnly, `id` = hash sha256 al token-ului,
niciodată token-ul brut), `attendance`, `grades`, `course_materials`, `gallery_albums` +
`gallery_photos`, `app_settings` (parola comună de student, bcrypt), `rate_limit_attempts`.

## Autentificare

Admin și student au fluxuri de login separate (cookie-uri diferite: `admin_session` /
`student_session`), sesiuni server-side (nu JWT) — `getSession(role)` verifică explicit rolul
alături de validitatea token-ului (vulnerabilitate CRITICĂ reparată în trecut: fără acest check,
un student putea copia cookie-ul propriu în slotul de admin și primea acces admin). Studenții
absolvenți sunt blocați la login și au sesiunile active tăiate imediat la marcarea ca absolvent.

## Galerie foto

Poze stocate pe disc (`public/gallery/<an>/`), servite **direct de nginx** (`location /gallery/
alias`), nu prin Next.js — `next start` nu recunoaște fișiere adăugate în `public/` după ultimul
build, deci componentele publice folosesc `<img>` simplu, nu `next/image`. Doar poze, fără video
(decizie explicită). Materialele de curs sunt opusul: stocate **în afara** `public/`, servite
protejat prin `/api/materiale/[id]` cu verificare de sesiune.

## Infrastructură (VPS)

Ubuntu 24.04, Postgres 16 (user dedicat, doar localhost), Node 22, aplicația rulează sub `pm2` ca
user dedicat **`seminar`** (nu root — hardening de securitate), nginx reverse-proxy + servire
directă a galeriei, certificat Let's Encrypt (auto-reînnoire), Cloudflare (proxy activ) pentru
DNS/HTTPS către vizitatori. SSH: doar autentificare prin cheie (`PasswordAuthentication no`,
`PermitRootLogin prohibit-password`), `fail2ban` activ pe portul 22.

**Backup:** snapshot **săptămânal** al întregului VPS, activat din panoul Hostinger (nivel
platformă — restaurează tot serverul, inclusiv Postgres și `public/gallery/`/`uploads/`; nu e
`pg_dump` separat). Configurat de user direct din Hostinger, opțiune existentă nativ pe planul
KVM1 (zilnic/săptămânal/lunar disponibile, ales săptămânal ca suficient pentru scara proiectului).
