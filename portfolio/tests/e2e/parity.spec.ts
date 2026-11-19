import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ORIGINAL = pathToFileURL(path.join(__dirname, "../fixtures/original.html")).href;
const PANELS = ["top", "about", "capabilities", "stack", "work", "approach", "contact"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "850", width: 850, height: 800 },
  { name: "640", width: 640, height: 800 },
];

// Show exactly one panel the way the original script would at a section boundary.
async function showOnly(page: Page, id: string) {
  await page.evaluate((target) => {
    document.querySelectorAll<HTMLElement>("#sectionStage > .panel").forEach((p) => {
      const on = p.id === target;
      p.classList.toggle("is-visible", on);
      p.classList.toggle("is-active", on);
      p.style.visibility = on ? "visible" : "hidden";
      p.style.opacity = on ? "1" : "0";
      p.style.zIndex = on ? "5" : "0";
      p.style.transform = "none";
    });
    // The active nav link is set by the scroll script (FEAT-20261119-1859); set it the same way on both pages.
    document.querySelectorAll<HTMLElement>("[data-panel-link]").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${target}`);
    });
  }, id);
}

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
