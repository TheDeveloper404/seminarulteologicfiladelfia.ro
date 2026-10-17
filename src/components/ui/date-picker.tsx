"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { todaySessionDate } from "@/lib/attendance/session-date";
import { formatPickerValue, getCalendarDays, parsePickerText, shiftPickerDate, type PickerMode } from "./date-picker-utils";

const MONTHS = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
const WEEKDAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
const controlClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-base hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:pointer-events-none";

type DatePickerProps = {
  id: string;
  name?: string;
  mode?: PickerMode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
};

export function DatePicker({ id, name, mode = "date", value, defaultValue = "", onValueChange, required, disabled, min, max, className }: DatePickerProps) {
  const [draft, setDraft] = useState(() => formatPickerValue(value ?? defaultValue, mode));
  const [lastValue, setLastValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(formatPickerValue(value ?? "", mode));
  }

  const parsed = parsePickerText(draft, mode);
  const valid = parsed !== null && (!parsed || ((!min || parsed >= min) && (!max || parsed <= max)));
  const message = !valid
    ? mode === "month" ? "Introdu o lună validă în format ll.aaaa." : "Introdu o dată validă în format zz.ll.aaaa."
    : required && !parsed ? "Completează acest câmp." : "";

  useEffect(() => {
    inputRef.current?.setCustomValidity(message);
  }, [message]);

  useEffect(() => {
    const form = inputRef.current?.form;
    function reset() {
      if (value === undefined) setDraft(formatPickerValue(defaultValue, mode));
      setTouched(false);
      setOpen(false);
    }
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue, mode, value]);

  function choose(next: string) {
    setDraft(formatPickerValue(next, mode));
    setTouched(false);
    onValueChange?.(next);
    setOpen(false);
  }

  return (
    <div className="min-w-0">
      <input type="hidden" name={name} value={valid ? parsed ?? "" : ""} disabled={disabled} />
      <Popover.Root open={open && !disabled} onOpenChange={setOpen} triggerId={`${id}-calendar-trigger`}>
        <div className="relative">
          <input ref={inputRef} id={id} type="text" inputMode="text"
            placeholder={mode === "month" ? "ll.aaaa" : "zz.ll.aaaa"}
            value={draft} required={required} disabled={disabled} autoComplete="off"
            aria-invalid={touched && !!message}
            aria-describedby={touched && message ? `${id}-error` : undefined}
            className={cn("h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 pr-12 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50", className)}
            onChange={(event) => {
              const text = event.target.value;
              setDraft(text);
              const next = parsePickerText(text, mode);
              if (next !== null && (!next || ((!min || next >= min) && (!max || next <= max)))) onValueChange?.(next);
            }}
            onBlur={() => {
              setTouched(true);
              if (valid && parsed !== null) setDraft(formatPickerValue(parsed, mode));
            }}
            onInvalid={(event) => { event.preventDefault(); setTouched(true); inputRef.current?.focus(); }}
            onKeyDown={(event) => {
              if (event.altKey && event.key === "ArrowDown") { event.preventDefault(); setOpen(true); }
            }}
          />
          <Popover.Trigger id={`${id}-calendar-trigger`} type="button" disabled={disabled} aria-label={mode === "month" ? "Alege luna și anul" : "Alege data"}
            className="absolute top-0 right-0 flex h-full w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
            <CalendarDays className="size-5" aria-hidden="true" />
          </Popover.Trigger>
        </div>
        <Popover.Portal>
          <Popover.Positioner sideOffset={6} align="end" className="z-[60]">
            <Popover.Popup className="w-[336px] max-w-[calc(100vw-1rem)] rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg outline-none">
              <Popover.Title className="sr-only">{mode === "month" ? "Alege luna și anul" : "Alege data"}</Popover.Title>
              <Popover.Description className="sr-only">Poți introduce anul direct. În calendar, folosește săgețile pentru zile și Page Up sau Page Down pentru luni. Enter selectează, Escape închide.</Popover.Description>
              <CalendarPanel mode={mode} selected={valid ? parsed ?? "" : ""} min={min} max={max} onChoose={choose} />
              <div className="mt-2 flex flex-wrap justify-between gap-1 border-t pt-2">
                <button type="button" className={controlClass} onClick={() => choose(mode === "month" ? todaySessionDate().slice(0, 7) : todaySessionDate())}
                  disabled={(!!min && (mode === "month" ? todaySessionDate().slice(0, 7) : todaySessionDate()) < min) || (!!max && (mode === "month" ? todaySessionDate().slice(0, 7) : todaySessionDate()) > max)}>
                  {mode === "month" ? "Luna curentă" : "Azi"}
                </button>
                {!required && <button type="button" className={controlClass} onClick={() => choose("")}>Șterge</button>}
                <Popover.Close className={controlClass}>Închide</Popover.Close>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {touched && message && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-destructive">{message}</p>}
    </div>
  );
}

function CalendarPanel({ mode, selected, min, max, onChoose }: {
  mode: PickerMode; selected: string; min?: string; max?: string; onChoose: (value: string) => void;
}) {
  const base = selected || todaySessionDate();
  const [year, setYear] = useState(Number(base.slice(0, 4)));
  const [month, setMonth] = useState(Number(base.slice(5, 7)));
  const [yearText, setYearText] = useState(base.slice(0, 4));
  const [monthsView, setMonthsView] = useState(mode === "month");
  const [focused, setFocused] = useState(mode === "date" && selected ? selected : `${base.slice(0, 7)}-01`);
  const gridRef = useRef<HTMLDivElement>(null);
  const cells = getCalendarDays(year, month);
  const rows = Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  const first = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;
  const tabDate = focused.startsWith(first.slice(0, 7)) ? focused : first;

  function changeYear(next: number) {
    setYear(next);
    setYearText(String(next).padStart(4, "0"));
  }
  function move(step: number) {
    if (monthsView) { changeYear(year + step); return; }
    const nextMonth = month + step;
    if (nextMonth < 1) { setMonth(12); changeYear(year - 1); }
    else if (nextMonth > 12) { setMonth(1); changeYear(year + 1); }
    else setMonth(nextMonth);
  }
  function commitYear() {
    const next = Number(yearText);
    if (/^\d{1,4}$/.test(yearText) && next >= 1 && next <= 9999) changeYear(next);
    else setYearText(String(year).padStart(4, "0"));
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const weekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekday, End: 6 - weekday };
    let next = offsets[event.key] !== undefined ? shiftPickerDate(date, offsets[event.key]) : "";
    if (event.key === "PageUp" || event.key === "PageDown") {
      const step = (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1);
      const serial = (year - 1) * 12 + month - 1 + step;
      if (serial < 0 || serial >= 9999 * 12) return;
      const nextYear = Math.floor(serial / 12) + 1;
      const nextMonth = serial % 12 + 1;
      const days = getCalendarDays(nextYear, nextMonth).filter(Boolean).length;
      next = `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-${String(Math.min(Number(date.slice(8)), days)).padStart(2, "0")}`;
    }
    if (!next) return;
    event.preventDefault();
    if ((min && next < min) || (max && next > max)) return;
    setFocused(next);
    changeYear(Number(next.slice(0, 4)));
    setMonth(Number(next.slice(5, 7)));
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus());
  }

  return (
    <>
      <div className="flex items-center justify-between gap-1">
        <button type="button" className={controlClass} aria-label={monthsView ? "Anul anterior" : "Luna anterioară"}
          disabled={year === 1 && (monthsView || month === 1)} onClick={() => move(-1)}><ChevronLeft className="size-4" /></button>
        <button type="button" className={cn(controlClass, "font-medium")} aria-label="Alege luna" onClick={() => setMonthsView(true)}>{monthsView ? "Luna" : MONTHS[month - 1]}</button>
        <input type="text" inputMode="numeric" aria-label="Anul" value={yearText} maxLength={4}
          className="h-11 w-20 rounded-lg border border-input bg-background px-2 text-center text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => setYearText(event.target.value.replace(/\D/g, ""))} onBlur={commitYear}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commitYear(); } }} />
        <button type="button" className={controlClass} aria-label={monthsView ? "Anul următor" : "Luna următoare"}
          disabled={year === 9999 && (monthsView || month === 12)} onClick={() => move(1)}><ChevronRight className="size-4" /></button>
      </div>
      {monthsView ? (
        <div className="mt-2 grid grid-cols-3 gap-1" aria-label={`Lunile anului ${year}`}>
          {MONTHS.map((label, index) => {
            const candidate = `${String(year).padStart(4, "0")}-${String(index + 1).padStart(2, "0")}`;
            return <button key={label} type="button" className={cn(controlClass, "px-1 text-sm", selected.slice(0, 7) === candidate && "bg-primary text-primary-foreground hover:bg-primary/90")}
              disabled={(!!min && candidate < min.slice(0, 7)) || (!!max && candidate > max.slice(0, 7))}
              onClick={() => { if (mode === "month") onChoose(candidate); else { setMonth(index + 1); setMonthsView(false); setFocused(`${candidate}-01`); } }}>{label}</button>;
          })}
        </div>
      ) : (
        <div ref={gridRef} role="grid" aria-label={`${MONTHS[month - 1]} ${year}`} className="mt-2">
          <div role="row" className="grid grid-cols-7">
            {WEEKDAYS.map((day) => <span key={day} role="columnheader" className="py-2 text-center text-sm text-muted-foreground">{day}</span>)}
          </div>
          {rows.map((row, index) => (
            <div role="row" key={index} className="grid grid-cols-7">
              {row.map((cell, i) => <div role="gridcell" key={cell?.value ?? `blank-${i}`} aria-selected={cell?.value === selected}>
                {cell && <button type="button" data-date={cell.value} tabIndex={cell.value === tabDate ? 0 : -1}
                  disabled={(!!min && cell.value < min) || (!!max && cell.value > max)}
                  aria-label={new Date(`${cell.value}T00:00:00Z`).toLocaleDateString("ro-RO", { dateStyle: "full", timeZone: "UTC" })}
                  aria-current={cell.value === todaySessionDate() ? "date" : undefined}
                  className={cn(controlClass, "w-full px-0", cell.value === selected && "bg-primary text-primary-foreground hover:bg-primary/90")}
                  onFocus={() => setFocused(cell.value)} onKeyDown={(event) => navigate(event, cell.value)} onClick={() => onChoose(cell.value)}>{cell.day}</button>}
              </div>)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
