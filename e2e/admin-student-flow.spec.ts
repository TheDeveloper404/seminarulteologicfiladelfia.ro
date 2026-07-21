import { test, expect } from "@playwright/test";
import { e2eEnv } from "./support/env";

// Flow legat: admin creează un student → îi adaugă o notă → studentul respectiv se
// autentifică și își vede nota. Serial + într-un singur fișier, ca să nu depindă de ordinea
// de rulare a altor fișiere de test (fiecare worker Playwright e un proces separat).
test.describe.configure({ mode: "serial" });

test.describe("flow admin → student", () => {
  const fullName = `E2E CRUD ${Date.now()}`;
  const subject = "Teologie Sistematică";
  let generatedPublicId = "";

  test("admin creează un student nou", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(e2eEnv.adminEmail());
    await page.getByLabel("Parolă").fill(e2eEnv.adminPassword());
    await page.getByRole("button", { name: "Autentificare" }).click();
    await expect(page).toHaveURL("/admin");

    await page.goto("/admin/studenti/nou");
    await page.getByLabel("Nume complet").fill(fullName);
    await page.getByLabel("An înscriere").fill(String(new Date().getFullYear()));
    await page.getByRole("button", { name: "Adaugă student" }).click();

    await expect(page).toHaveURL("/admin/studenti");
    const row = page.getByRole("row", { name: new RegExp(fullName) });
    await expect(row).toBeVisible();

    generatedPublicId = (await row.locator("td").first().innerText()).trim();
    expect(generatedPublicId).toMatch(/^[A-Z0-9]{6}$/);
  });

  test("admin adaugă o notă studentului creat", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(e2eEnv.adminEmail());
    await page.getByLabel("Parolă").fill(e2eEnv.adminPassword());
    await page.getByRole("button", { name: "Autentificare" }).click();
    await expect(page).toHaveURL("/admin");

    await page.goto("/admin/studenti");
    const row = page.getByRole("row", { name: new RegExp(fullName) });
    await row.getByRole("link", { name: "Note" }).click();

    await page.getByLabel("Disciplină").fill(subject);
    await page.getByLabel("Notă (1-10)").fill("9.5");
    await page.getByRole("button", { name: "Adaugă notă" }).click();

    await expect(page.getByRole("cell", { name: subject })).toBeVisible();
  });

  test("studentul creat se autentifică și își vede nota", async ({ page }) => {
    await page.goto("/portal/login");
    await page.getByLabel("ID student").fill(generatedPublicId);
    await page.getByLabel("Parolă").fill(e2eEnv.studentSharedPassword());
    await page.getByRole("button", { name: "Autentificare" }).click();

    await expect(page).toHaveURL("/portal");
    await expect(page.getByRole("heading", { name: `Bine ai venit, ${fullName}` })).toBeVisible();

    await page.goto("/portal/note");
    await expect(page.getByRole("cell", { name: subject })).toBeVisible();
    await expect(page.getByRole("cell", { name: "9.50" })).toBeVisible();

    // Fără prezență/materiale seedate pentru acest student — empty state-urile trebuie să apară.
    await page.goto("/portal/prezenta");
    await expect(page.getByText(/nicio|nu există|nu s-a înregistrat/i)).toBeVisible();
  });
});
