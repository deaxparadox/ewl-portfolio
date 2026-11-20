import type { Page } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const ORIGINAL = pathToFileURL(path.join(__dirname, "../fixtures/original.html")).href;
export const PANELS = ["top", "about", "capabilities", "stack", "work", "approach", "contact"];

// Show exactly one panel the way the original script would at a section boundary.
export async function showOnly(page: Page, id: string) {
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

// Wait until the scroll script has rendered once (original writes bar width, Next writes bar transform).
export async function ready(page: Page) {
  await page.waitForFunction(() => {
    const bar = document.getElementById("progress");
    return !!(bar && (bar.style.width || bar.style.transform));
  });
  await page.waitForFunction(() => document.getElementById("year")?.textContent);
}

export async function settle(page: Page) {
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}
