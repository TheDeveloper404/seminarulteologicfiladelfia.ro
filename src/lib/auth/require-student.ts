import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireStudent() {
  const session = await getSession("student");
  if (!session) {
    redirect("/portal/login");
  }
  return session;
}
