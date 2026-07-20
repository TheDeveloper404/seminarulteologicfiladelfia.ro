import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";

export type SessionRole = "admin" | "student";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 zile

const COOKIE_NAMES: Record<SessionRole, string> = {
  admin: "admin_session",
  student: "student_session",
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  role: SessionRole,
  userId: number
): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: hashToken(token),
    role,
    adminId: role === "admin" ? userId : null,
    studentId: role === "student" ? userId : null,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES[role], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(role: SessionRole) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES[role])?.value;
  if (!token) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, hashToken(token)))
    .limit(1);

  if (!session || session.expiresAt < new Date()) return null;

  return session;
}

export async function destroySession(role: SessionRole): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES[role])?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }
  cookieStore.delete(COOKIE_NAMES[role]);
}
