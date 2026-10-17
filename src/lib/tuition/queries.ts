import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { students, studentTuition, tuitionMonths } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireStudent } from "@/lib/auth/require-student";

export async function getAdminTuition(month: string) {
  await requireAdmin();
  const monthRows = await db.select().from(tuitionMonths)
    .where(eq(tuitionMonths.month, `${month}-01`)).limit(1);
  const selectedMonth = monthRows[0] ?? null;
  const rows = selectedMonth
    ? await db.select({
        id: studentTuition.id,
        fullName: students.fullName,
        paid: studentTuition.paid,
      }).from(studentTuition)
        .innerJoin(students, eq(studentTuition.studentId, students.id))
        .where(eq(studentTuition.monthId, selectedMonth.id))
        .orderBy(asc(students.fullName))
    : [];
  return { month: selectedMonth, rows };
}

export async function getStudentTuition() {
  const session = await requireStudent();
  return db.select({
    month: tuitionMonths.month,
    amount: tuitionMonths.amount,
    paid: studentTuition.paid,
  }).from(studentTuition)
    .innerJoin(tuitionMonths, eq(studentTuition.monthId, tuitionMonths.id))
    .where(eq(studentTuition.studentId, session.studentId!))
    .orderBy(desc(tuitionMonths.month));
}
