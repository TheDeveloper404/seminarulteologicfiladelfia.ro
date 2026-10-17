import { describe, expect, it } from "vitest";
import {
  formatPickerValue,
  getCalendarDays,
  parsePickerText,
  shiftPickerDate,
  type PickerMode,
} from "./date-picker-utils";

describe("parsePickerText", () => {
  // "returns canonical YYYY-MM-DD or YYYY-MM, '' for trimmed blank; accepts local DD.MM.YYYY / MM.YYYY and canonical ISO."
  it.each<[string, PickerMode, string]>([
    ["17.10.2026", "date", "2026-10-17"],
    ["2026-10-17", "date", "2026-10-17"],
    ["  29.02.2000\t", "date", "2000-02-29"],
    ["29.02.2024", "date", "2024-02-29"],
    ["01.01.0001", "date", "0001-01-01"],
    ["0099-12-31", "date", "0099-12-31"],
    ["31.12.9999", "date", "9999-12-31"],
    ["02.2000", "month", "2000-02"],
    ["2026-10", "month", "2026-10"],
    [" 01.0001\n", "month", "0001-01"],
    ["12.9999", "month", "9999-12"],
    ["", "date", ""],
    [" \t\n", "date", ""],
    ["", "month", ""],
    [" \t\n", "month", ""],
  ])("should parse %j in %s mode as %j", (text, mode, expected) => {
    expect(parsePickerText(text, mode)).toBe(expected);
  });

  // "Strict real calendar incl leap years and years0001..9999, rejects zero year/extra text/invalid dates/modes day zero"
  it.each<[string, PickerMode]>([
    ["29.02.1900", "date"],
    ["1900-02-29", "date"],
    ["29.02.2025", "date"],
    ["31.04.2026", "date"],
    ["2026-02-30", "date"],
    ["2026-01-00", "date"],
    ["00.01.2026", "date"],
    ["32.01.2026", "date"],
    ["01.00.2026", "date"],
    ["2026-13-01", "date"],
    ["0000-01-01", "date"],
    ["01.01.0000", "date"],
    ["10000-01-01", "date"],
    ["1.01.2026", "date"],
    ["2026-1-01", "date"],
    ["17/10/2026", "date"],
    ["2026-10-17T00:00:00Z", "date"],
    ["prefix2026-10-17", "date"],
    ["17.10.2026 extra", "date"],
    ["2026-10", "date"],
    ["10.2026", "date"],
    ["2026-10-17", "month"],
    ["17.10.2026", "month"],
    ["0000-01", "month"],
    ["01.0000", "month"],
    ["10000-01", "month"],
    ["2026-00", "month"],
    ["13.2026", "month"],
    ["1.2026", "month"],
    ["2026-1", "month"],
    ["10.2026 extra", "month"],
    ["not a date", "date"],
  ])("should reject %j in %s mode", (text, mode) => {
    expect(parsePickerText(text, mode)).toBeNull();
  });
});

describe("formatPickerValue", () => {
  // "formatPickerValue(value,mode) returns DD.MM.YYYY/MM.YYYY for valid canonical"
  it.each<[string, PickerMode, string]>([
    ["2000-02-29", "date", "29.02.2000"],
    ["1900-02-28", "date", "28.02.1900"],
    ["0001-01-01", "date", "01.01.0001"],
    ["0099-12-31", "date", "31.12.0099"],
    ["9999-12-31", "date", "31.12.9999"],
    ["2000-02", "month", "02.2000"],
    ["0001-01", "month", "01.0001"],
    ["9999-12", "month", "12.9999"],
  ])("should format %j in %s mode as %j and roundtrip", (value, mode, expected) => {
    const formatted = formatPickerValue(value, mode);

    expect(formatted).toBe(expected);
    expect(parsePickerText(formatted, mode)).toBe(value);
  });

  // "formatPickerValue(value,mode) returns DD.MM.YYYY/MM.YYYY for valid canonical, '' blank/invalid"
  it.each<[string, PickerMode]>([
    ["", "date"],
    [" \t", "month"],
    ["1900-02-29", "date"],
    ["2026-04-31", "date"],
    ["0000-01-01", "date"],
    ["2026-01-00", "date"],
    ["2026-1-01", "date"],
    ["2026-10-17 extra", "date"],
    ["2026-10", "date"],
    ["2026-10-17", "month"],
    ["0000-01", "month"],
    ["2026-13", "month"],
    ["nonsense", "month"],
  ])("should return blank for invalid %j in %s mode", (value, mode) => {
    expect(formatPickerValue(value, mode)).toBe("");
  });
});

describe("getCalendarDays", () => {
  // "Monday-first leading nulls then actual days, no trailing blanks"
  it.each([
    { year: 2026, month: 6, leading: 0, count: 30 }, // Monday
    { year: 2026, month: 2, leading: 6, count: 28 }, // Sunday
    { year: 2000, month: 2, leading: 1, count: 29 }, // Tuesday, leap century
    { year: 1900, month: 2, leading: 3, count: 28 }, // Thursday, common century
    { year: 2026, month: 10, leading: 3, count: 31 },
    { year: 1, month: 1, leading: 0, count: 31 },
    { year: 9999, month: 12, leading: 2, count: 31 },
  ])("should return the exact Monday-first grid for $year-$month", ({ year, month, leading, count }) => {
    const cells = getCalendarDays(year, month);
    const prefix = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
    const expectedDays = Array.from({ length: count }, (_, index) => ({
      value: `${prefix}-${String(index + 1).padStart(2, "0")}`,
      day: index + 1,
    }));

    expect(cells).toEqual([...Array(leading).fill(null), ...expectedDays]);
  });
});

describe("shiftPickerDate", () => {
  // "cross-month/year UTC shift, stays within years1..9999 (clamp boundaries)"
  it.each<[string, number, string]>([
    ["2026-10-17", 0, "2026-10-17"],
    ["2026-01-31", 1, "2026-02-01"],
    ["2026-03-01", -1, "2026-02-28"],
    ["2000-02-28", 1, "2000-02-29"],
    ["2000-02-29", 1, "2000-03-01"],
    ["2000-03-01", -1, "2000-02-29"],
    ["1900-02-28", 1, "1900-03-01"],
    ["2026-12-31", 1, "2027-01-01"],
    ["2026-01-01", -1, "2025-12-31"],
    ["2024-01-01", 366, "2025-01-01"],
    ["2025-01-01", -366, "2024-01-01"],
    ["0099-12-31", 1, "0100-01-01"],
    ["0001-01-01", 0, "0001-01-01"],
    ["0001-01-01", -1, "0001-01-01"],
    ["0001-01-02", -366, "0001-01-01"],
    ["9999-12-31", 0, "9999-12-31"],
    ["9999-12-31", 1, "9999-12-31"],
    ["9999-12-30", 366, "9999-12-31"],
    ["2026-03-29", 1, "2026-03-30"], // European DST start
    ["2026-10-25", 1, "2026-10-26"], // European DST end
    ["2026-03-08", 1, "2026-03-09"], // North American DST start
    ["2026-11-01", 1, "2026-11-02"], // North American DST end
  ])("should shift %s by %i days to %s independently of local midnight", (value, days, expected) => {
    expect(shiftPickerDate(value, days)).toBe(expected);
  });
});
