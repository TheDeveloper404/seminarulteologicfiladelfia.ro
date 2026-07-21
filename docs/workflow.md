# Workflow de lucru

Deploy-ul rămâne manual pe VPS (vezi [`deploy.md`](deploy.md)) — nu există CI/CD care publică
automat. Există însă automatizări GitHub care rulează pe fiecare push/PR:

## CI (`.github/workflows/ci.yml`)

`lint` + `test` (vitest) + `build` (type-check strict) pe fiecare push/PR către `main`. Nu
înlocuiește verificarea locală înainte de deploy — doar prinde regresii cât mai devreme, înainte
să ajungă pe VPS.

## CodeQL (`.github/workflows/codeql.yml`)

Analiză statică de securitate (SAST), gratuită pe repo public — rulează pe push/PR și săptămânal
(luni 03:00 UTC), independent de push-uri, ca să prindă și vulnerabilități noi descoperite în cod
deja existent. Rezultatele apar în tab-ul Security al repo-ului pe GitHub.

## Dependabot (`.github/dependabot.yml`)

- verifică dependențele **npm** lunar, grupate într-un singur PR
- doar update-uri **patch/minor** ajung automat în PR ("mature") — update-urile **majore** sunt
  ignorate explicit (`ignore: update-types: version-update:semver-major`), verificate manual
  când chiar e nevoie, ca să nu vină breaking changes nesupravegheate
- verifică și acțiunile GitHub folosite în workflow-uri (`actions/checkout`, `codeql-action` etc.)
  — reintrodus 2026-07-21 după ce au apărut `ci.yml`/`codeql.yml` (fusese scos inițial pentru că
  nu exista niciun workflow de verificat, eșua constant cu `not found`)
- **Dependabot security alerts** (diferit de update-urile lunare de mai sus) — activat separat pe
  repo, anunță imediat dacă apare un CVE cunoscut într-o dependință, nu așteaptă ciclul lunar

## Merge după un PR de Dependabot

După un PR de Dependabot mărjuit pe GitHub, `git pull` local poate cere merge (branch-uri
divergente dacă ai commit-uri locale nepushate) — e normal, fișierele nu se suprapun de obicei
(`package.json`/`package-lock.json` vs. codul tău), merge simplu, fără conflicte.

## Ciclul unei modificări

1. Implementare + `npm run lint` + `npm run test` (unitare)
2. `npm run build` (type-check strict) — obligatoriu după schimbări de tipuri/schemă
3. CHANGELOG.md actualizat cu o intrare nouă
4. Commit + push din VS Code Source Control, direct pe `main` (decizie explicită — site static,
   un singur dezvoltator, fără dev/PR)
5. Deploy manual pe VPS (vezi [`deploy.md`](deploy.md)) când modificarea trebuie să ajungă live
