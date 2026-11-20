import { expect, test, type Page } from "@playwright/test";
import { ORIGINAL, PANELS, showOnly } from "./helpers";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "850", width: 850, height: 800 },
  { name: "640", width: 640, height: 800 },
];

async function shot(page: Page, url: string, id: string) {
  await page.goto(url);
  await page.waitForFunction(() => document.getElementById("year")?.textContent);
  await showOnly(page, id);
  return page.screenshot({ animations: "disabled" });
}

for (const vp of VIEWPORTS) {
  test.describe(`visual parity @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });
    for (const id of PANELS) {
      test(`panel #${id} matches the original`, async ({ page }) => {
        const original = await shot(page, ORIGINAL, id);
        const next = await shot(page, "/", id);
        expect(next.equals(original)).toBe(true);
      });
    }
  });
}

test("negative: parity check detects a real difference", async ({ page }) => {
  const original = await shot(page, ORIGINAL, "about");
  await page.goto("/");
  await showOnly(page, "about");
  await page.addStyleTag({ content: ".about-text { color: red !important; }" });
  const changed = await page.screenshot({ animations: "disabled" });
  expect(changed.equals(original)).toBe(false);
});
