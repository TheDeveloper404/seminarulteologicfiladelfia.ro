import { test, expect } from "@playwright/test";
import { e2eEnv } from "./support/env";

test.describe("autentificare student", () => {
  test("acces la /portal fără sesiune redirectează la login", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test("login cu ID greșit afișează eroare, fără sesiune", async ({ page }) => {
    await page.goto("/portal/login");
    await page.getByLabel("ID student").fill("NUEXISTA");
    await page.getByLabel("Parolă").fill(e2eEnv.studentSharedPassword());
    await page.getByRole("button", { name: "Autentificare" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test("login cu parolă greșită afișează eroare", async ({ page }) => {
    await page.goto("/portal/login");
    await page.getByLabel("ID student").fill(e2eEnv.studentPublicId());
    await page.getByLabel("Parolă").fill("parola-gresita-cu-siguranta");
    await page.getByRole("button", { name: "Autentificare" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test("student absolvent este respins la login", async ({ page }) => {
    await page.goto("/portal/login");
    await page.getByLabel("ID student").fill(e2eEnv.graduatedPublicId());
    await page.getByLabel("Parolă").fill(e2eEnv.studentSharedPassword());
    await page.getByRole("button", { name: "Autentificare" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/portal\/login/);
  });

  test("login cu credențiale corecte duce la contul meu, logout duce înapoi la login", async ({
    page,
  }) => {
    await page.goto("/portal/login");
    await page.getByLabel("ID student").fill(e2eEnv.studentPublicId());
    await page.getByLabel("Parolă").fill(e2eEnv.studentSharedPassword());
    await page.getByRole("button", { name: "Autentificare" }).click();

    await expect(page).toHaveURL("/portal");
    await expect(page.getByRole("heading", { name: /Bine ai venit/ })).toBeVisible();

    await page.getByRole("button", { name: "Delogare" }).first().click();

    await expect(page).toHaveURL(/\/portal\/login/);
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal\/login/);
  });
});
