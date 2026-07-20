# Document de decizie — funcționalități noi seminarulteologicfiladelfia.ro

**Scop:** prezentare pentru client a variantelor discutate, cu riscuri și avantaje/dezavantaje,
pentru cele trei cereri noi (galerie foto pe ani, catalog digital de prezență, distribuție
materiale de curs) și decizia de infrastructură care le susține pe toate. Nu e un plan de
implementare — e materialul de decizie înainte să începem codul.

---

## 1. Context și cereri

Clientul (Seminarul Teologic Filadelfia) a cerut trei lucruri noi, peste site-ul static existent
(Next.js, live pe Vercel, fără DB, fără admin):

1. **Galerie foto/video pe `/arhiva`, organizată pe ani de absolvire.**
2. **Panel de admin cu catalog digital de prezență** — seminarul se ține o dată pe lună, adminul
   trebuie să poată marca cine a participat.
3. **Distribuție de materiale de curs către studenți, fără conturi.** Ideea inițială era
   ID+parolă per student; am respins-o pentru că mulți studenți nu sunt confortabili cu
   calculatorul și ar uita credențialele. Alternativa discutată: adminul încarcă materialul,
   generează un link valabil temporar (~3 zile), îl trimite manual (WhatsApp/email) — fără conturi,
   fără JWT.

Toate trei necesită, pentru prima dată în acest proiect, **o bază de date, stocare de fișiere și
un mecanism de autentificare pentru admin** — lucruri care nu există deloc azi în arhitectură.
Asta a deschis o discuție separată despre infrastructură, pentru că alegerea afectează toate cele
trei funcționalități deodată.

---

## 2. Decizia de infrastructură

### Cerințe reale exprimate de client/tine
- **Un singur dashboard** pentru site + date + fișiere, nu servicii împrăștiate.
- **Facturare anuală, nu lunară** — predictibilitate de cost.
- Control rezonabil pe date, fără să fie neapărat un motiv de suveranitate strictă a datelor.

### Variante evaluate

| | **A. Vercel-native** (Vercel + Neon DB + Vercel Blob) | **B. VPS gol**, administrat manual | **C. VPS + Coolify** (self-hosted PaaS) |
|---|---|---|---|
| **Ce e** | Rămânem pe Vercel (cum e azi), adăugăm Neon Postgres și Vercel Blob prin Vercel Marketplace — apar în același dashboard Vercel. | Un server închiriat (ex. Hostinger KVM), pe care instalăm și administrăm manual nginx, certificate SSL (Certbot), procesul Node (pm2/Docker), Postgres. | Un server închiriat, dar cu **Coolify** (platformă open-source, gratuită) instalată deasupra — dă un dashboard web propriu cu deploy din Git, provisioning de Postgres cu un click, SSL automat, storage de fișiere. |
| **Facturare** | Lunară/usage-based prin natura serviciilor cloud (Vercel Pro, Neon, Blob) — nu se potrivește cu preferința pentru plată anuală. | Anuală, cost fix (server-ul). | Anuală, cost fix (server-ul) + Coolify e gratuit. |
| **Un singur dashboard?** | Da — totul apare în contul Vercel (proiect + Marketplace). | Nu — SSH + fișiere de config răspândite, fără UI unificat. | Da — dashboard-ul Coolify arată deploy-uri, DB, storage, toate într-un loc. |
| **Mentenanță** | Zero — Vercel gestionează tot (SSL, patch-uri, scalare). | Mare — tu ești responsabil de update-uri OS, reînnoire SSL, backup-uri, monitorizare. Risc real dacă nimeni nu are timp dedicat de sysadmin. | Moderată — Coolify automatizează SSL și deploy, dar tot trebuie update-uri ocazionale la OS și la Coolify însuși. Mult mai puțin decât varianta B. |
| **CI/CD** | Automat, integrat (push → deploy). | Manual, de construit de la zero (script SSH sau GitHub Actions custom). | Automat prin Coolify (push → build → deploy), similar cu Vercel. |
| **Rollback la deploy stricat** | Un click în Vercel. | Manual. | Coolify păstrează istoricul de deploy-uri, rollback din UI. |
| **Cost estimat** | Variabil — poate depăși $102/an dacă traficul/spațiul cresc peste tier-ul gratuit (de verificat prețuri curente Vercel Pro/Neon/Blob). | ~$102/an (Hostinger KVM1) + timpul de administrare (cost ascuns, nu monetar dar real). | ~$102/an (Hostinger KVM1), Coolify gratuit. |
| **Risc principal** | Nu satisface cerința de facturare anuală. | Risc de securitate pe termen lung dacă nimeni nu patch-uiește serverul; overhead de timp subestimat frecvent. | Server-ul tot trebuie monitorizat minim (uptime, spațiu disc, update-uri Coolify) — responsabilitate reală, dar redusă. |

### Actualizare (2026-07-20): fără Coolify

Userul a decis să se ocupe singur de VPS-ul Hostinger, **fără Coolify** — administrare directă
(Postgres + proces Node), nu prin platforma self-hosted PaaS descrisă mai jos. Analiza
Vercel-native vs. VPS gol vs. VPS+Coolify rămâne validă ca istoric al deciziei (de ce VPS și nu
Vercel), dar coloana "C. VPS + Coolify" nu se mai aplică — mentenanța, deploy-ul și SSL-ul cad în
sarcina userului, fără automatizările pe care le-ar fi oferit Coolify.

### Recomandare inițială: **Varianta C (VPS + Coolify)** — depășită de actualizarea de mai sus

Satisface toate cele trei cerințe reale (un dashboard, facturare anuală, control pe date) și
evită cea mai mare parte din durerea operațională a unui VPS administrat manual. Riscul rămas
(mentenanță minimă a serverului) e acceptabil pentru un site instituțional de acest volum.

### Dimensionare server (rezolvat)

S-a ridicat inițial întrebarea dacă Hostinger KVM1 (1 vCPU / 4GB RAM / 50GB, ~$102/an) e suficient,
pentru că documentația Coolify recomandă minim 2 vCPU. **Concluzie după analiză: KVM1 e suficient.**
Traficul real (site static + panel de admin folosit de 1-2 persoane, o dată pe lună) nu pune
presiune de runtime pe CPU; RAM-ul deja depășește minimul cerut de Coolify. Singurul cost al unui
singur vCPU e un build Docker mai lent la fiecare deploy (minute, nu ore) — un inconvenient
ocazional, nu un risc de stabilitate în producție. Upgrade la KVM2 rămâne o opțiune ulterioară,
dacă build-urile devin dureros de lente în practică, nu o precondiție.

### Cost ascuns de menționat clientului: migrarea de pe Vercel

Site-ul e deja live pe Vercel (Production, promovat manual). Mutarea pe VPS înseamnă **refacerea
efectivă a deploy-ului** (Dockerfile, `next.config.ts` adaptat pentru self-hosting, redirecționare
DNS de la Vercel către IP-ul VPS-ului) — muncă deja făcută o dată pentru Vercel, care se repetă
pentru noua infrastructură. Nu e un motiv să nu facem mutarea, dar clientul trebuie să știe că nu
e "gratis" față de a rămâne pe Vercel — e cost de migrare, nu doar cost de infrastructură nouă.

---

## 3. Galerie foto/video pe ani de absolvire

Cea mai simplă și mai puțin riscantă dintre cele trei cereri. Structura actuală (`galerii.ts`,
componentele `GalleryGrid`/`Lightbox`) există deja dar e complet goală și fără concept de an.

**Ce se schimbă:** albume + fotografii mutate din fișier static în baza de date nouă, cu un câmp
"an de absolvire"; pagina `/arhiva` grupează automat pe ani; adminul încarcă poze printr-o pagină
simplă din panel, nu mai printr-un script CLI cu copiere manuală de cod (planul vechi, gândit
pentru Vercel Blob, nu se mai potrivește odată ce există oricum un panel de admin).

**Risc:** scăzut — nu atinge date personale, nu expune nimic public în afara pozelor în sine.
Singurul punct de atenție tehnică e validarea fișierelor încărcate (tip, dimensiune).

**Clasificare:** NORMAL.

---

## 4. Catalog digital de prezență

Panel de admin unde staff-ul marchează cine a participat la sesiunea lunară.

**Date reținute (minimizare deliberată):** nume complet + un singur contact opțional
(telefon SAU email, nu ambele obligatorii). Fără CNP, fără dată de naștere, fără adresă — nu
sunt necesare și le evităm explicit.

**Autentificare admin:** necesară, pentru că altfel oricine ar putea modifica prezențele. Cel mai
simplu mecanism sănătos: cont(uri) de admin în baza de date (1-2 conturi, pentru staff), sesiune
pe cookie server-side — **fără JWT, fără conturi de student**, exact cum ați vrut de la început.

**Risc:** date personale + o graniță de autentificare reală, chiar dacă simplă. Nu e un sistem
complex, dar merită tratat cu atenție pentru că orice autentificare + date personale intră automat
la nivelul cel mai strict de verificare din procesul nostru intern.

**Clasificare:** CRITICAL (din cauza combinației auth + date personale, nu din cauza complexității
tehnice — mecanismul rămâne simplu).

---

## 5. Distribuție materiale de curs — decizie deschisă

Aici sunt trei variante reale, cu diferențe mari de efort și risc. **Asta rămâne decizia de
discutat cu clientul** înainte să scriem cod.

| | **A. Doar Drive/MEGA, în afara site-ului** | **B. Drive/MEGA + evidență în admin** | **C. Sistem custom, link cu expirare automată** |
|---|---|---|---|
| **Cum funcționează** | Adminul încarcă fișierul în Google Drive sau MEGA, ia link-ul de share, îl trimite manual pe WhatsApp/email. Site-ul nu e implicat deloc. | Ca la A, dar în panelul de admin există un tabel unde adminul lipește link-ul + luna, pentru istoric într-un singur loc. | Fișierele stau pe VPS-ul vostru; sistemul generează automat un link unic, care expiră exact la 3 zile fără intervenție manuală. |
| **Efort de dezvoltare** | Zero. | Mic — un tabel simplu în DB, un formular. | Mare — tabel de fișiere + tabel de token-uri, hash-uire de token, validare la fiecare acces, pagină de "link expirat", endpoint de download care re-validează independent. |
| **Expirare la 3 zile** | Manuală — adminul trebuie să-și amintească să șteargă/dezactiveze link-ul. Notă: Drive oferă expirare automată a link-urilor doar pe conturi Google Workspace, nu pe Gmail obișnuit (de verificat dacă seminarul are sau ar avea nevoie de așa ceva); MEGA la fel, doar pe conturi plătite. | Aceeași limitare ca A. | Automată și garantată — punctul forte al acestei variante. |
| **Risc de securitate adăugat pe site** | Zero — nimic nou expus public. | Foarte mic — tabelul nu găzduiește fișiere, doar linkuri text. | Real — endpoint public neautentificat, expus la path traversal, ghicire/enumerare de token-uri, necesită audit de securitate dedicat înainte de lansare. |
| **Consolidare ("totul într-un dashboard")** | Nu — fișierele și link-urile trăiesc în afara site-ului. | Parțial — istoricul e în admin, fișierele nu. | Da — complet integrat. |
| **Clasificare la implementare** | N/A (nu e cod) | NORMAL | CRITICAL |

### Recomandarea mea: **Varianta A sau B**, nu C

Pentru un fișier trimis o dată pe lună la câteva zeci de studenți, sistemul custom (C) e mult
efort și risc de securitate pentru un beneficiu marginal (expirare automată vs. ștergere manuală
de 2 minute de către admin). E genul de complexitate pe care ar trebui s-o construim doar dacă
apare un motiv concret (volum mare, cerință legală de expirare strictă, materiale sensibile). Între
A și B, diferența e doar dacă vreți istoric în admin sau nu — decizie ieftină de schimbat oricând,
chiar și după lansare.

**Rămâne de discutat cu clientul.**

---

## 6. Ordine de implementare recomandată

Confirmat: prezența + materialele de curs au prioritate față de galerie, pentru că au valoare
operativă imediată la următoarea sesiune lunară.

1. **Infrastructură** (VPS + Coolify + Postgres + adaptare deploy) — blochează tot restul, trebuie
   făcută prima.
2. **Autentificare admin** — fundație comună pentru catalogul de prezență și (dacă se alege
   varianta B sau C) pentru materiale de curs.
3. **Catalog digital de prezență.**
4. **Materiale de curs** — în funcție de varianta aleasă la punctul 5 (A/B/C).
5. **Galerie foto pe ani de absolvire** — ultima, pentru că nu are termen fix și e cea mai simplă.

---

## 7. Portal student — decizie extinsă (2026-07-20)

**Scop extins față de secțiunea 5.** Discuția cu clientul a mers dincolo de simpla distribuire de
materiale: site-ul rămâne static pentru vizitatori, dar pentru studenți se adaugă un **portal cu
autentificare**, nu doar link-uri temporare fără cont. Secțiunea 5 (variantele A/B/C fără conturi)
e **înlocuită** de acest portal — decizia clientului a fost explicit "vrem conturi", nu link-uri
trimise manual.

### Ce trebuie să facă fiecare rol

- **Admin** (panel separat): încarcă cursurile/materialele, ține catalogul online de prezență
  (marchează cine a participat la sesiunea lunară), gestionează arhiva studenților care au
  absolvit.
- **Student** (autentificat): vede notele, vede prezența proprie, descarcă materialele de curs.

**Actualizare (2026-07-20): scoasă situația de plată** (atât din admin, cât și din portalul
student) — decizie user, fără justificare de a afișa "cât a plătit" în lipsa unei integrări reale
de plată. Vezi CHANGELOG (34).

### Autentificare student: ID unic (generat aleator) + parolă comună

Decizie discutată și confirmată cu clientul: **nu** magic link (prea complicat pentru studenți mai
puțin confortabili cu calculatorul), **nu** user+parolă individuală (aceeași problemă de suport —
uită credențialele), **nu** ultimele 6 cifre din CNP ca ID.

- **ID unic per student**: generat aleator de admin la înscriere (cod alfanumeric, ex. 6
  caractere), **nu secvențial și nu derivat din CNP**.
  - Motiv respingere CNP: ultimele 6 cifre din CNP conțin codul de județ (constant pentru
    majoritatea studenților din aceeași zonă) + doar 3 cifre secvențiale reale — spațiu de căutare
    mic, ghicibil în combinație cu o parolă comună cunoscută. În plus, folosirea CNP ca
    identificator de login nu are justificare legală sub GDPR/ANSPDCP când există o alternativă la
    fel de simplă (cod generat) — risc de conformitate, nu doar de securitate.
- **Parolă comună**, aceeași pentru toți studenții, setată/resetată din panelul admin.
- **Risc acceptat conștient**: parola fiind comună, orice utilizator care o cunoaște + ghicește un
  ID valid ar putea vedea date ale altui student (note, prezență, situație plată — fără date de
  plată procesate real, nu e integrare cu un sistem de plăți). Clientul a acceptat acest risc
  explicit, motivat de faptul că nu există stimulent real pentru un student să acceseze contul
  altcuiva (nimic monetar în joc, doar informații administrative). Condiția tehnică pusă drept
  contrapondere minimă: ID-urile trebuie să fie negribile/aleatorii, nu secvențiale — altfel riscul
  ar deveni trivial de exploatat.

**Clasificare la implementare:** CRITICAL (auth + date personale + date financiare afișate), chiar
dacă mecanismul de autentificare în sine e simplu — la fel ca la catalogul de prezență (secțiunea
4), motivul clasificării e combinația auth+date sensibile, nu complexitatea tehnică.

---

## 8. Riscuri generale și puncte de clarificat cu clientul

- **Cine face mentenanța VPS pe termen lung?** Chiar și cu Coolify, cineva trebuie să verifice
  ocazional update-uri și spațiu pe disc. Dacă nu există cineva dedicat, riscul crește în timp.
- **Backup:** baza de date + fișierele încărcate (poze, eventual materiale de curs) trebuie
  backup-uite — Coolify are opțiuni, dar trebuie configurate explicit, nu vin "din oficiu".
- **Migrarea DNS:** planul actual din `CLAUDE.md` presupune Cloudflare → Vercel; se schimbă în
  Cloudflare → IP-ul VPS-ului. Trebuie refăcut acel pas, nu e o simplă continuare a planului vechi.
- **Contul EmailJS pentru formularul de contact rămâne neschimbat** — nu face parte din această
  discuție, e încă ON HOLD pe accesul la `seminar.filadelfia@gmail.com`.
