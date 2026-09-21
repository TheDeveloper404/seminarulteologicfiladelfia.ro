import { describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ db: { execute: vi.fn() } }));

const { isMatricolConflict, parseMatricolInput, withMatricolRetry, MATRICOL_UNIQUE_CONSTRAINT } =
  await import("./matricol");

const matricolPgError = { code: "23505", constraint: MATRICOL_UNIQUE_CONSTRAINT };

describe("parseMatricolInput", () => {
  it("câmp gol sau doar spații → fără număr", () => {
    expect(parseMatricolInput("")).toEqual({ ok: true, value: null });
    expect(parseMatricolInput("   ")).toEqual({ ok: true, value: null });
  });

  it("acceptă întregi pozitivi", () => {
    expect(parseMatricolInput("713")).toEqual({ ok: true, value: 713 });
    expect(parseMatricolInput(" 689 ")).toEqual({ ok: true, value: 689 });
  });

  it("respinge zero, negative, zecimale, litere și valori uriașe", () => {
    for (const bad of ["0", "-5", "7.5", "12a", "abc", "99999999", "1e3"]) {
      expect(parseMatricolInput(bad)).toEqual({ ok: false });
    }
  });
});

describe("isMatricolConflict", () => {
  it("recunoaște eroarea pg directă și pe cea împachetată de Drizzle (cause)", () => {
    expect(isMatricolConflict(matricolPgError)).toBe(true);
    expect(isMatricolConflict(new Error("Failed query", { cause: matricolPgError }))).toBe(true);
  });

  it("ignoră alte încălcări de unicitate (ex. public_id) și alte erori", () => {
    expect(isMatricolConflict({ code: "23505", constraint: "students_public_id_unique" })).toBe(
      false
    );
    expect(isMatricolConflict({ code: "23503", constraint: MATRICOL_UNIQUE_CONSTRAINT })).toBe(
      false
    );
    expect(isMatricolConflict(new Error("boom"))).toBe(false);
    expect(isMatricolConflict(null)).toBe(false);
  });
});

describe("withMatricolRetry", () => {
  it("reia după un conflict de număr matricol și întoarce rezultatul", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(matricolPgError)
      .mockRejectedValueOnce(matricolPgError)
      .mockResolvedValue("ok");

    await expect(withMatricolRetry(operation)).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("nu reia la alte erori", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("altceva"));

    await expect(withMatricolRetry(operation)).rejects.toThrow("altceva");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("se oprește după numărul maxim de încercări", async () => {
    const operation = vi.fn().mockRejectedValue(matricolPgError);

    await expect(withMatricolRetry(operation, 3)).rejects.toBe(matricolPgError);
    expect(operation).toHaveBeenCalledTimes(3);
  });
});
