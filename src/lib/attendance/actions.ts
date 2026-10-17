"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isValidSessionDate } from "./session-date";

export async function setAttendance(
  studentId: number,
  sessionDate: string,
  present: boolean
): Promise<void> {
  await requireAdmin();

  if (!isValidSessionDate(sessionDate)) {
    throw new Error("Format de dată invalid.");
  }

  await db.insert(attendance).values({ studentId, sessionDate, present })
    .onConflictDoUpdate({
      target: [attendance.studentId, attendance.sessionDate],
      set: { present },
    });

  revalidatePath("/admin/studenti");
}
