import { sql } from "drizzle-orm";
import type { db } from "@/db";
import { studentTuition, tuitionMonths } from "@/db/schema";
import { todaySessionDate } from "@/lib/attendance/session-date";

/**
 * Studentul nou intră, ca Neplătit, în luna curentă (fusul orar al seminarului) și în lunile
 * viitoare deja create. Lunile anterioare înscrierii nu i se adaugă. Se apelează în aceeași
 * tranzacție cu inserarea studentului (formular și import din registru).
 */
export async function addNewStudentToTuition(executor: Pick<typeof db, "execute">, studentId: number) {
  const currentMonth = `${todaySessionDate().slice(0, 7)}-01`;
  await executor.execute(sql`
    insert into ${studentTuition} ("month_id", "student_id")
    select ${tuitionMonths.id}, ${studentId} from ${tuitionMonths}
    where ${tuitionMonths.month} >= ${currentMonth}
  `);
}
