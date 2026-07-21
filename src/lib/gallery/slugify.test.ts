import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates the title, prefixed by year", () => {
    expect(slugify("Seminar de vară", 2025)).toBe("2025-seminar-de-vara");
  });

  it("strips diacritics", () => {
    expect(slugify("Absolvire Șăîâț", 2018)).toBe("2018-absolvire-saiat");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("Cursuri & Absolvire!!  2018", 2018)).toBe(
      "2018-cursuri-absolvire-2018"
    );
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("---Seminar---", 2016)).toBe("2016-seminar");
  });

  it("falls back to the bare year when the title has no usable characters", () => {
    expect(slugify("!!!", 2013)).toBe("2013");
    expect(slugify("", 2013)).toBe("2013");
  });
});
