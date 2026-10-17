import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DatePicker } from "./date-picker";

describe("DatePicker form markup contract", () => {
  it.each([
    { mode: "date" as const, value: "2026-10-17", display: "17.10.2026" },
    { mode: "month" as const, value: "2026-10", display: "10.2026" },
  ])("keeps the $mode form value in ISO while displaying Romanian numeric format", ({ mode, value, display }) => {
    const html = renderToStaticMarkup(createElement(DatePicker, { id: "date", name: "date", mode, defaultValue: value, required: true }));
    const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map(([tag]) => tag);
    expect(inputs.find((tag) => tag.includes('type="hidden"'))).toContain(`name="date" value="${value}"`);
    const visible = inputs.find((tag) => tag.includes('type="text"'))!;
    expect(visible).toContain(`value="${display}"`);
    expect(visible).toMatch(/inputmode="text"/i);
    expect(visible).toContain("required");
    expect(visible).not.toContain('name="date"');
    expect(html).not.toMatch(/type="(?:date|month)"/);
  });

  it("disables both the visible field and the submitted field", () => {
    const html = renderToStaticMarkup(createElement(DatePicker, { id: "disabled", name: "date", defaultValue: "2026-10-17", disabled: true }));
    const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map(([tag]) => tag);
    expect(inputs).toHaveLength(2);
    expect(inputs.every((tag) => tag.includes("disabled"))).toBe(true);
  });

  it("submits an empty value for an optional empty date", () => {
    const html = renderToStaticMarkup(createElement(DatePicker, { id: "empty", name: "date" }));
    expect(html).toContain('type="hidden" name="date" value=""');
    expect(html).not.toContain("required");
  });

  it("uses the controlled value instead of the default", () => {
    const html = renderToStaticMarkup(createElement(DatePicker, { id: "controlled", name: "date", value: "2024-02-29", defaultValue: "2026-10-17" }));
    expect(html).toContain('type="hidden" name="date" value="2024-02-29"');
    expect(html).toContain('value="29.02.2024"');
  });

  it("does not submit a month outside the existing field bounds", () => {
    const html = renderToStaticMarkup(createElement(DatePicker, { id: "bounded", name: "month", mode: "month", min: "1000-01", max: "9999-12", defaultValue: "0999-12" }));
    expect(html).toContain('type="hidden" name="month" value=""');
  });
});
