// Citește variabilele de test (populate deja în process.env de dotenv, încărcat o singură
// dată din playwright.config.ts) — fail-fast cu mesaj clar dacă lipsește ceva, în loc de un
// eșec confuz mai târziu în test.
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Lipsește variabila de mediu ${name} — vezi .env.e2e.example.`);
  }
  return value;
}

export const e2eEnv = {
  adminEmail: () => requiredEnv("E2E_ADMIN_EMAIL"),
  adminPassword: () => requiredEnv("E2E_ADMIN_PASSWORD"),
  studentSharedPassword: () => requiredEnv("E2E_STUDENT_SHARED_PASSWORD"),
  studentPublicId: () => requiredEnv("E2E_STUDENT_PUBLIC_ID"),
  graduatedPublicId: () => requiredEnv("E2E_GRADUATED_PUBLIC_ID"),
};
