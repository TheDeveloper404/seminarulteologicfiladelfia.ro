"use client";

import { useTransition } from "react";
import { setAttendance } from "@/lib/attendance/actions";

export function AttendanceCheckbox({
  studentId,
  sessionDate,
  initialPresent,
}: {
  studentId: number;
  sessionDate: string;
  initialPresent: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      className="size-4"
      defaultChecked={initialPresent}
      disabled={isPending}
      onChange={(e) => {
        const present = e.target.checked;
        startTransition(() => {
          setAttendance(studentId, sessionDate, present);
        });
      }}
    />
  );
}
