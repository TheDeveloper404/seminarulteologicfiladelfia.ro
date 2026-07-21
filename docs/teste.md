# Teste

Suită **vitest** (`src/**/*.test.ts`, 23 teste) pe logica critică — nu pe componente UI:

- `src/lib/auth/session.test.ts` — hash-uire token (determinist, niciodată token-ul brut)
- `src/lib/students/generate-public-id.test.ts` — alfabet fără caractere ambigue (0/O/1/I/L),
  format ID generat
- `src/lib/gallery/slugify.test.ts` — diacritice, fallback pe an gol
- `src/lib/contact/schema.test.ts` — validare Zod (honeypot, email, lungime mesaj)
- `src/lib/rate-limit.test.ts` — prag de decizie (mock la nivelul round-trip-ului DB)

```bash
npm run test        # rulează toată suita (vitest run)
```

## Split de responsabilitate

Proiect cu `HUMAN_RUNS_TESTS` activ (vezi `.claude/`): testele **unitare** (vitest — rapide, fără
efecte secundare) rulează local/CI; testele **e2e** (Playwright, când vor exista) rulează manual,
de către dezvoltator — nu automat.

`npm run lint` (ESLint) și `npm run build` (type-check strict + Turbopack) sunt obligatorii după
orice schimbare de tipuri/schemă — vitest verde nu garantează type-check verde.
