import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireAdmin() {
  const session = await getSession("admin");
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
