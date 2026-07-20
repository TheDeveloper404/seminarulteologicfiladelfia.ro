"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function setAttendance(
  studentId: number,
  sessionDate: string,
  present: boolean
): Promise<void> {
  await requireAdmin();

  const [existing] = await db
    .select({ id: attendance.id })
    .from(attendance)
    .where(
      and(eq(attendance.studentId, studentId), eq(attendance.sessionDate, sessionDate))
    )
    .limit(1);

  if (existing) {
    await db.update(attendance).set({ present }).where(eq(attendance.id, existing.id));
  } else {
    await db.insert(attendance).values({ studentId, sessionDate, present });
  }

  revalidatePath("/admin/prezenta");
}
