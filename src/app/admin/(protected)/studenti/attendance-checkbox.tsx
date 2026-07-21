"use client";

import { useEffect, useRef, useState } from "react";
import { setAttendance } from "@/lib/attendance/actions";

export function AttendanceCheckbox({
  studentId,
  sessionDate,
  initialPresent,
  onPendingChange,
}: {
  studentId: number;
  sessionDate: string;
  initialPresent: boolean;
  onPendingChange: (pending: boolean) => void;
}) {
  const pendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);

  // Dacă un rând rămâne montat cu o scriere în curs (schimbare rapidă de student/re-render),
  // nu lăsăm contorul de pending "agățat" — anunțăm părintele că nu mai e nimic în zbor.
  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        // Marcat false ÎNAINTE de onPendingChange: fără asta, `finally`-ul din onChange (tot
        // în zbor la unmount, promisiunea nu se anulează) mai decrementează o dată contorul
        // părintelui la rezolvare, ducându-l pe negativ și dezactivând silențios fix-ul de
        // race condition pentru scrierile următoare.
        pendingRef.current = false;
        onPendingChange(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <input
      type="checkbox"
      className="size-4"
      defaultChecked={initialPresent}
      disabled={isPending}
      onChange={async (e) => {
        const present = e.target.checked;
        pendingRef.current = true;
        setIsPending(true);
        onPendingChange(true);
        try {
          await setAttendance(studentId, sessionDate, present);
        } finally {
          // Dacă s-a demontat între timp, cleanup-ul de mai sus a decrementat deja contorul
          // părintelui — nu mai decrementăm a doua oară aici (ar duce contorul pe negativ).
          if (pendingRef.current) {
            pendingRef.current = false;
            setIsPending(false);
            onPendingChange(false);
          }
        }
      }}
    />
  );
}
