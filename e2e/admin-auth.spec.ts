import { test, expect } from "@playwright/test";
import { e2eEnv } from "./support/env";

test.describe("autentificare admin", () => {
  test("acces la /admin fără sesiune redirectează la login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login cu credențiale greșite afișează eroare, fără sesiune", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(e2eEnv.adminEmail());
    await page.getByLabel("Parolă").fill("parola-gresita-cu-siguranta");
    await page.getByRole("button", { name: "Autentificare" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login cu credențiale corecte duce la panoul de control, logout duce înapoi la login", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(e2eEnv.adminEmail());
    await page.getByLabel("Parolă").fill(e2eEnv.adminPassword());
    await page.getByRole("button", { name: "Autentificare" }).click();

    await expect(page).toHaveURL("/admin");
    await expect(page.getByRole("heading", { name: "Panou de control" })).toBeVisible();

    await page.getByRole("button", { name: "Delogare" }).first().click();

    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
