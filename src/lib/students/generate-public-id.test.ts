import { describe, expect, it } from "vitest";
import { ALPHABET, randomCandidate } from "./generate-public-id";

const AMBIGUOUS_CHARS = ["0", "O", "1", "I", "L"];

describe("generate-public-id alphabet", () => {
  it("excludes visually ambiguous characters (ID-uri citite/copiate de mână)", () => {
    for (const char of AMBIGUOUS_CHARS) {
      expect(ALPHABET).not.toContain(char);
    }
  });
});

describe("randomCandidate", () => {
  it("generates a 6-character id", () => {
    expect(randomCandidate()).toHaveLength(6);
  });

  it("only uses characters from the allowed alphabet", () => {
    for (let i = 0; i < 100; i++) {
      const id = randomCandidate();
      for (const char of id) {
        expect(ALPHABET).toContain(char);
      }
    }
  });

  it("produces varied output across calls (not a constant)", () => {
    const ids = new Set(Array.from({ length: 50 }, () => randomCandidate()));
    expect(ids.size).toBeGreaterThan(1);
  });
});
