import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Portal studenți — Autentificare",
  robots: { index: false, follow: false },
};

export default function PortalLoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <LoginForm />
    </div>
  );
}
