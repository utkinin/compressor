import { expect, type Page } from "@playwright/test";

export const briefFile = {
  name: "process-note.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("Тестовая задача: требуется уточнить параметры существующей установки.\n", "utf8"),
};

export async function fillBriefContact(page: Page) {
  await page.locator("#brief-name").fill("Тестовый инженер");
  await page.locator("#brief-company").fill("Тестовая организация Brief");
  await page.locator("#brief-email").fill("brief-fixture@example.test");
}

export async function expectBriefIntake(page: Page) {
  await expect(page.getByRole("heading", { name: "Опишите задачу или приложите ТЗ", exact: true })).toBeVisible();
  await expect(page.locator("#brief-description")).toHaveValue("");
  await expect(page.locator("#brief-gas")).toHaveValue("");
  await expect(page.locator("#brief-consent")).not.toBeChecked();
  await expect(page.locator(".rfq-shell")).not.toBeVisible();
}
