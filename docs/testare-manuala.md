# Listă de testare manuală

Ghid de smoke-testing pentru portalul admin+student și site-ul public — de rulat manual, în
browser, după orice schimbare la autentificare/CRUD/formulare. Nu înlocuiește cele 27 de teste
automate (`npm run test`, vitest) — acelea verifică logică izolată (rate-limit, sesiuni,
validare Zod etc.) și rulează deja curat la fiecare schimbare de cod. Lista de mai jos verifică
**fluxurile complete, din browser**, exact ce ar fi acoperit un e2e automat.

**Atenție la rate limiting:** login-ul e limitat la 10 încercări/15min (admin) și 5/15min
(student, pentru că toți studenții au aceeași parolă). Dacă greșești de multe ori la secțiunile
de mai jos și te blochează, aștepți 15 minute sau resetezi manual din DB (`DELETE FROM
rate_limit_attempts;`).

---

## 1. Autentificare admin

| # | Pași | Aștepți |
|---|------|---------|
| 1.1 | Accesează `/admin` fără sesiune (fereastră incognito) | Redirect automat la `/admin/login` |
| 1.2 | La `/admin/login`, introdu email greșit sau parolă greșită | Mesaj de eroare vizibil, rămâi pe pagina de login |
| 1.3 | Login cu credențiale corecte | Redirect la `/admin`, vezi „Panou de control” cu statistici |
| 1.4 | Din panoul admin, apasă „Delogare” | Redirect la `/admin/login` |
| 1.5 | După delogare, încearcă din nou `/admin` direct din URL | Te trimite înapoi la login (sesiunea chiar s-a șters) |

## 2. Autentificare student

| # | Pași | Aștepți |
|---|------|---------|
| 2.1 | Accesează `/portal` fără sesiune | Redirect la `/portal/login` |
| 2.2 | Login cu ID de student inexistent | Eroare, rămâi pe login |
| 2.3 | Login cu ID valid + parolă greșită | Eroare, rămâi pe login |
| 2.4 | Login cu ID + parola comună corectă | Redirect la `/portal`, „Bine ai venit, ...” |
| 2.5 | Dacă ai un student marcat „Absolvent” (secțiunea 5), încearcă login cu ID-ul lui | Respins, mesaj de eroare (absolvenții nu se mai pot loga) |
| 2.6 | Delogare din portal | Redirect la `/portal/login`, sesiune ștearsă |

## 3. CRUD studenți (admin)

| # | Pași | Aștepți |
|---|------|---------|
| 3.1 | `/admin/studenti/nou` — completează nume + an înscriere, salvează | Redirect la `/admin/studenti`, studentul apare în listă cu un ID generat automat (6 caractere) |
| 3.2 | Caută studentul nou după nume în bara de căutare | Filtrare corectă, live |
| 3.3 | Sortează după nume / an înscriere / an studiu (click pe headerele de coloană) | Ordinea se schimbă corect, ascendent/descendent |
| 3.4 | „Editează” pe un student, modifică un câmp, salvează | Modificarea apare în listă |
| 3.5 | „Șterge” un student de test | Dispare din listă (confirmă mai întâi dialogul de ștergere) |

## 4. Note

| # | Pași | Aștepți |
|---|------|---------|
| 4.1 | Din lista de studenți, „Note” pe un student, adaugă o notă (disciplină + notă 1-10 + dată) | Apare imediat în tabelul de note al studentului (admin) |
| 4.2 | Logează-te ca acel student în `/portal/note` | Nota adăugată apare identic |
| 4.3 | Student fără nicio notă → `/portal/note` | Empty state „Nicio notă înregistrată”, nu eroare/pagină goală |

## 5. Prezență

| # | Pași | Aștepți |
|---|------|---------|
| 5.1 | `/admin/prezenta`, marchează prezența unui student pentru o sesiune | Se salvează, checkbox rămâne bifat la reîncărcare |
| 5.2 | Logează-te ca acel student, `/portal/prezenta` | Sesiunea marcată apare, cu badge „Prezent”/„Absent” corect |
| 5.3 | Student fără nicio prezență înregistrată → `/portal/prezenta` | Empty state „Nicio sesiune înregistrată încă” |

## 6. Materiale de curs

| # | Pași | Aștepți |
|---|------|---------|
| 6.1 | `/admin/materiale`, încarcă un fișier (titlu + descriere opțională) | Apare în listă, cu numele original |
| 6.2 | Ca student logat, `/portal/materiale`, descarcă fișierul | Se descarcă, numele fișierului descărcat = numele original încărcat |
| 6.3 | Șterge materialul din admin | Dispare din `/admin/materiale` și din `/portal/materiale` |

## 7. Galerie foto (publică)

| # | Pași | Aștepți |
|---|------|---------|
| 7.1 | `/admin/galerie`, creează un album nou (titlu + an) | Apare în listă |
| 7.2 | Intră în album, încarcă 1-2 poze | Apar în grid, imediat vizibile |
| 7.3 | Vizitează `/arhiva` fără să fii logat (fereastră incognito) | Albumul + pozele sunt vizibile public, fără autentificare |
| 7.4 | Click pe o poză | Se deschide lightbox-ul, navighezi cu prev/next |
| 7.5 | Șterge o poză / albumul din admin | Dispare și din vizualizarea publică |

## 8. Absolvenți

| # | Pași | Aștepți |
|---|------|---------|
| 8.1 | Editează un student, bifează „Absolvent” + dată absolvire, salvează | Dispare din `/admin/studenti` (lista activilor) |
| 8.2 | Verifică `/admin/absolventi` | Apare acolo |
| 8.3 | Încearcă login cu ID-ul acelui student în `/portal/login` | Respins (vezi și 2.5) |

## 9. Formular de contact

| # | Pași | Aștepți |
|---|------|---------|
| 9.1 | `/contact`, trimite formularul cu date valide | Confirmare vizuală de succes |
| 9.2 | Trimite cu email invalid sau câmp obligatoriu gol | Eroare de validare, nu se trimite |
| 9.3 | Verifică `seminar.filadelfia@gmail.com` | Email primit (poate ajunge în Spam prima dată, e ok — vezi CHANGELOG) |

## 10. Site public — general

| # | Pași | Aștepți |
|---|------|---------|
| 10.1 | Homepage + o pagină de conținut (ex. `/despre-noi`) + `/arhiva` (fără poze) + `/contact` | Se încarcă corect, fără erori în consolă |
| 10.2 | Redimensionează fereastra sub 768px lățime (sau folosește meniul mobil din DevTools) | Meniul mobil (hamburger) funcționează, se deschide/închide |
| 10.3 | Navighează pe o pagină cu conținut puțin (ex. `/studenti/vizitatori`) | Footer-ul e lipit de capătul paginii, fără spațiu alb dedesubt (bug rezolvat azi) |
| 10.4 | Navighează între 2-3 pagini diferite | Tranziția (fade-in) rulează lin, fără sărituri de layout |
