# Rute

**Public** (`src/app/(site)/`): homepage, `despre-noi` (+ subpagini: conducerea, crez, istoric,
mesaj-director, misiune, organizarea, regulament), `studenti` (+ subpagini), `admitere` (+
subpagini), `absolventi` (+ subpagini), `profesori`, `programa-educationala`, `arhiva` +
`arhiva/[slug]` (galerie foto, citește din Postgres, `force-dynamic`), `contact` (Server Action →
Maileroo).

**Admin** (`/admin`, protejat prin `admin_session`): dashboard, `studenti` (+ `[id]`, `[id]/note`,
`nou`), `prezenta`, `absolventi`, `materiale`, `galerie` (+ `[id]` pentru management poze),
`login` (public).

**Portal student** (`/portal`, protejat prin `student_session`): dashboard, `note`, `prezenta`,
`materiale`, `login` (public).

**API**: `GET /api/materiale/[id]` — singura rută API, download material de curs, respinge fără
sesiune (401).
