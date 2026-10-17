export type PickerMode = "date" | "month";

function utcDate(year: number, month: number, day: number) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function parsePickerText(text: string, mode: PickerMode): string | null {
  const value = text.trim();
  if (!value) return "";
  const iso = mode === "month" ? /^(\d{4})-(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2})$/;
  const local = mode === "month" ? /^(\d{2})\.(\d{4})$/ : /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = iso.exec(value);
  const ro = match ? null : local.exec(value);
  if (!match && !ro) return null;
  const year = Number(match ? match[1] : ro![mode === "month" ? 2 : 3]);
  const month = Number(match ? match[2] : ro![mode === "month" ? 1 : 2]);
  const day = mode === "month" ? 1 : Number(match ? match[3] : ro![1]);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = utcDate(year, month, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const result = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
  return mode === "month" ? result : `${result}-${String(day).padStart(2, "0")}`;
}

export function formatPickerValue(value: string, mode: PickerMode): string {
  const parsed = parsePickerText(value, mode);
  if (!parsed) return "";
  const [year, month, day] = parsed.split("-");
  return mode === "month" ? `${month}.${year}` : `${day}.${month}.${year}`;
}

export function getCalendarDays(year: number, month: number): (null | { value: string; day: number })[] {
  const start = utcDate(year, month, 1);
  const offset = (start.getUTCDay() + 6) % 7;
  const days = utcDate(year, month + 1, 0).getUTCDate();
  return [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: days }, (_, index) => ({
      value: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
      day: index + 1,
    })),
  ];
}

export function shiftPickerDate(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const next = utcDate(year, month, day + days);
  if (next.getUTCFullYear() < 1) return "0001-01-01";
  if (next.getUTCFullYear() > 9999) return "9999-12-31";
  return next.toISOString().slice(0, 10);
}
