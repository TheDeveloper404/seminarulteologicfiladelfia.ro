"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { setAttendance } from "@/lib/attendance/actions";
import { isValidSessionDate, todaySessionDate } from "@/lib/attendance/session-date";
import { cn } from "@/lib/utils";
import { AttendanceFormStrip } from "./attendance-form-strip";

type AttendanceStudent = {
  id: number;
  fullName: string;
  studyYear: number;
  recentAttendance: { sessionDate: string; present: boolean }[];
};

// `undefined` = nemarcat (nu există rând în DB) — diferit de „absent”, care e o alegere explicită.
type Marks = Record<number, boolean | undefined>;

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatLongDate(sessionDate: string): string {
  return dateFormatter.format(new Date(`${sessionDate}T00:00:00Z`));
}

export function AttendanceSheet({
  students,
  sessionDate,
  presentByStudentId,
}: {
  students: AttendanceStudent[];
  sessionDate: string;
  presentByStudentId: Record<number, boolean>;
}) {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();

  const [query, setQuery] = useState("");
  const [marks, setMarks] = useState<Marks>(presentByStudentId);
  const [pickedDate, setPickedDate] = useState(sessionDate);
  const [savingIds, setSavingIds] = useState<ReadonlySet<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // La schimbarea sesiunii (navigare, back-button) pornim de la datele noii sesiuni.
  const [shownSession, setShownSession] = useState(sessionDate);
  if (shownSession !== sessionDate) {
    setShownSession(sessionDate);
    setPickedDate(sessionDate);
    setMarks(presentByStudentId);
    setError(null);
  }

  const hasPendingWrites = savingIds.size > 0;

  function goToDate(next: string) {
    setPickedDate(next);
    if (!isValidSessionDate(next) || next === sessionDate) return;
    setError(null);
    startNavigation(() => {
      router.push(`/admin/studenti?vedere=prezenta&data=${next}`);
    });
  }

  async function saveMark(student: AttendanceStudent, present: boolean) {
    if (marks[student.id] === present || savingIds.has(student.id)) return;

    const previous = marks[student.id];
    setError(null);
    setMarks((m) => ({ ...m, [student.id]: present }));
    setSavingIds((ids) => new Set(ids).add(student.id));

    try {
      await setAttendance(student.id, sessionDate, present);
    } catch {
      setMarks((m) => ({ ...m, [student.id]: previous }));
      setError(`Nu s-a putut salva prezența pentru ${student.fullName}. Încearcă din nou.`);
    } finally {
      setSavingIds((ids) => {
        const next = new Set(ids);
        next.delete(student.id);
        return next;
      });
    }
  }

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    for (const student of students) {
      const mark = marks[student.id];
      if (mark === true) present++;
      else if (mark === false) absent++;
    }
    return { present, absent, unmarked: students.length - present - absent };
  }, [students, marks]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = normalized
      ? students.filter((s) => s.fullName.toLowerCase().includes(normalized))
      : students;
    return [...base].sort((a, b) => a.fullName.localeCompare(b.fullName, "ro"));
  }, [students, query]);

  const today = todaySessionDate();
  const dateLocked = hasPendingWrites || isNavigating;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="data-sesiune" className="text-base font-medium">
            Data sesiunii
          </label>
          <div className="flex gap-2">
            <input
              id="data-sesiune"
              type="date"
              value={pickedDate}
              disabled={dateLocked}
              onChange={(e) => goToDate(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-base disabled:opacity-60"
            />
            <button
              type="button"
              disabled={dateLocked || sessionDate === today}
              onClick={() => goToDate(today)}
              className="h-11 rounded-lg border border-input bg-background px-4 text-base font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Azi
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold first-letter:uppercase">
            {formatLongDate(sessionDate)}
          </p>
          <p className="mt-1 text-base text-muted-foreground" aria-live="polite">
            {hasPendingWrites
              ? "Se salvează..."
              : `Prezenți ${counts.present} · Absenți ${counts.absent} · Nemarcați ${counts.unmarked} (din ${students.length})`}
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-base text-destructive">
          {error}
        </p>
      ) : null}

      <div className="relative mt-4 w-full max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută după nume..."
          className="h-11 pl-10 text-base md:text-base"
          aria-label="Caută student după nume"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-base text-muted-foreground">
          Niciun student nu corespunde căutării „{query}”.
        </p>
      ) : (
        <div
          className={cn(
            "mt-4 overflow-x-auto rounded-lg border transition-opacity",
            isNavigating && "opacity-50"
          )}
        >
          <table className="w-full text-base">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="w-full p-4 font-medium">Student</th>
                <th className="p-4 font-medium whitespace-nowrap">An studiu</th>
                <th className="p-4 font-medium whitespace-nowrap">Prezență la această dată</th>
                <th className="p-4 font-medium whitespace-nowrap">Istoric (ultimele 10)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const mark = marks[student.id];
                const saving = savingIds.has(student.id);
                return (
                  <tr key={student.id} className="border-t">
                    <td className="p-4">{student.fullName}</td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground">
                      {student.studyYear === 2 ? "Anul II" : "Anul I"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div
                        role="group"
                        aria-label={`Prezență ${student.fullName}`}
                        className="flex gap-2"
                      >
                        <button
                          type="button"
                          aria-pressed={mark === true}
                          disabled={saving}
                          onClick={() => saveMark(student, true)}
                          className={cn(
                            "h-10 min-w-24 rounded-lg border px-4 text-base font-medium transition-colors disabled:cursor-wait",
                            mark === true
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-input bg-background hover:bg-muted"
                          )}
                        >
                          Prezent
                        </button>
                        <button
                          type="button"
                          aria-pressed={mark === false}
                          disabled={saving}
                          onClick={() => saveMark(student, false)}
                          className={cn(
                            "h-10 min-w-24 rounded-lg border px-4 text-base font-medium transition-colors disabled:cursor-wait",
                            mark === false
                              ? "border-destructive bg-destructive text-white"
                              : "border-input bg-background hover:bg-muted"
                          )}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <AttendanceFormStrip records={student.recentAttendance} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
