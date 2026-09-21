import { sql } from "drizzle-orm";
import { db } from "@/db";

export const MATRICOL_UNIQUE_CONSTRAINT = "students_matricol_number_unique";

/**
 * Următorul număr matricol, calculat în chiar instrucțiunea INSERT (subinterogare), nu într-un
 * SELECT separat — fereastra dintre „citesc max” și „scriu” rămâne cât mai mică. Două inserări
 * concurente pot totuși calcula același număr; constrângerea UNIQUE o respinge pe a doua, iar
 * `withMatricolRetry` o reia cu numărul următor.
 */
export const NEXT_MATRICOL_SQL = sql`(SELECT COALESCE(MAX(matricol_number), 0) + 1 FROM students)`;

/** Numărul afișat în formularul „Adaugă student” — cel real se atribuie la salvare. */
export async function getNextMatricolNumber(): Promise<number> {
  const result = await db.execute<{ next: number }>(
    sql`SELECT COALESCE(MAX(matricol_number), 0) + 1 AS next FROM students`
  );
  return Number(result.rows[0].next);
}

type PgErrorLike = { code?: string; constraint?: string; cause?: unknown };

/** Drizzle ≥0.44 împachetează eroarea `pg` în `cause`; căutăm în tot lanțul. */
export function isMatricolConflict(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    const { code, constraint, cause } = current as PgErrorLike;
    if (code === "23505" && constraint === MATRICOL_UNIQUE_CONSTRAINT) return true;
    current = cause;
  }
  return false;
}

/** Reia operația dacă a pierdut cursa pentru același număr matricol cu o inserare concurentă. */
export async function withMatricolRetry<T>(operation: () => Promise<T>, attempts = 5): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= attempts || !isMatricolConflict(error)) throw error;
    }
  }
}

export type MatricolInput = { ok: true; value: number | null } | { ok: false };

/** Câmp gol → `null` (fără număr); altfel trebuie să fie un întreg pozitiv, rezonabil. */
export function parseMatricolInput(raw: string): MatricolInput {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };
  if (!/^\d{1,7}$/.test(trimmed)) return { ok: false };
  const value = Number(trimmed);
  return value >= 1 ? { ok: true, value } : { ok: false };
}
