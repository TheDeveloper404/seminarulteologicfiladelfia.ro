"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { students, studentTuition, tuitionMonths } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

export type TuitionFormState = { error?: string; success?: string } | null;

export async function createTuitionMonth(
  _prevState: TuitionFormState,
  formData: FormData
): Promise<TuitionFormState> {
  const session = await requireAdmin();
  const month = String(formData.get("month") ?? "");
  if (!/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(month)) {
    return { error: "Alege o lună validă." };
  }

  try {
    const created = await db.transaction(async (tx) => {
      const [row] = await tx.insert(tuitionMonths)
        .values({ month: `${month}-01`, amount: 60 })
        .onConflictDoNothing({ target: tuitionMonths.month })
        .returning({ id: tuitionMonths.id });
      if (!row) return false;

      await tx.execute(sql`
        insert into ${studentTuition} ("month_id", "student_id")
        select ${row.id}, ${students.id} from ${students}
        where ${eq(students.graduated, false)}
      `);
      return true;
    });
    if (!created) return { error: "Luna este deja adăugată." };
  } catch {
    return { error: "Luna nu a putut fi adăugată. Încearcă din nou." };
  }

  console.info(JSON.stringify({ type: "tuition_event", event: "month_created", adminId: session.adminId, month }));
  revalidatePath("/admin/taxe");
  revalidatePath("/portal/taxe");
  redirect(`/admin/taxe?luna=${month}`);
}

export async function setTuitionPaid(
  feeId: number,
  paid: boolean,
  _prevState: TuitionFormState,
  _formData: FormData
): Promise<TuitionFormState> {
  const session = await requireAdmin();
  void _prevState;
  void _formData;
  if (!Number.isSafeInteger(feeId) || feeId <= 0 || typeof paid !== "boolean") {
    return { error: "Plată invalidă." };
  }

  try {
    const rows = await db.update(studentTuition).set({ paid })
      .where(eq(studentTuition.id, feeId)).returning({ id: studentTuition.id });
    if (rows.length === 0) return { error: "Plata nu a fost găsită." };
  } catch {
    return { error: "Plata nu a putut fi actualizată. Încearcă din nou." };
  }

  console.info(JSON.stringify({ type: "tuition_event", event: "payment_updated", adminId: session.adminId, feeId, paid }));
  revalidatePath("/admin/taxe");
  revalidatePath("/portal/taxe");
  return { success: "Plata a fost actualizată." };
}
