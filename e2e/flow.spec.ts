import { test, expect } from "@playwright/test";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIX = resolve(__dirname, "..", "fixtures");

test.describe("LPJ analytics happy path", () => {
  test("upload → dashboard → butir soal → PDF", async ({ page }) => {
    await page.goto("/");
    // Upload pretest + posttest
    await page.setInputFiles('[data-testid="file-pretest"]', resolve(FIX, "Pretest.xlsx"));
    await page.setInputFiles('[data-testid="file-posttest"]', resolve(FIX, "Posttest.xlsx"));
    await expect(page.getByText(/Pratinjau/i)).toBeVisible();
    await page.getByRole("button", { name: /Simpan/i }).click();

    // Dashboard
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByText(/Jumlah Peserta/i)).toBeVisible();

    // Butir Soal
    await page.getByRole("button", { name: /Butir Soal/i }).click();
    await expect(page.getByText(/KR-20/)).toBeVisible();
    await page.locator('[data-testid^="soal-row-"]').first().click();
    await expect(page.getByText(/Distraktor/i)).toBeVisible();

    // Export PDF
    await page.getByRole("button", { name: /Dashboard/i }).click();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("export-pdf").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
