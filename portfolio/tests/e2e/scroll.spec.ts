import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ORIGINAL = pathToFileURL(path.join(__dirname, "../fixtures/original.html")).href;
const FRACTIONS = [0, 0.25, 0.5, 0.75];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "640", width: 640, height: 800 },
];

async function settle(page: Page) {
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

// The scroll script writes the progress bar on its first render, so this means "script is running".
async function ready(page: Page) {
  await page.waitForFunction(() => {
    const bar = document.getElementById("progress");
    return !!(bar && (bar.style.width || bar.style.transform));
  });
}

async function open(page: Page, url: string) {
  await page.goto(url);
  await ready(page);
  await page.waitForFunction(() => document.getElementById("year")?.textContent);
  // Hide the progress bar for pixel comparison; its width is checked separately (it uses transform, not width).
  await page.addStyleTag({ content: ".progress{visibility:hidden}" });
  await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
}

async function shotAt(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await settle(page);
  return page.screenshot({ animations: "disabled" });
}

const barWidth = (page: Page) =>
  page.evaluate(() => document.getElementById("progress")!.getBoundingClientRect().width);

for (const vp of VIEWPORTS) {
  test.describe(`scroll parity @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("every scroll position renders pixel-identical to the original, in both directions", async ({ page }) => {
      const positions: number[] = [];
      for (let i = 0; i <= 5; i++) for (const f of FRACTIONS) positions.push((i + f) * vp.height);
      positions.push(6 * vp.height);
      const order = [...positions, ...[...positions].reverse()]; // down, then back up

      await open(page, ORIGINAL);
      const original: Buffer[] = [];
      for (const y of order) original.push(await shotAt(page, y));
      const origBars: number[] = [];
      for (const y of order) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await settle(page);
        origBars.push(await barWidth(page));
      }

      await open(page, "/");
      const mismatches: string[] = [];
      for (let k = 0; k < order.length; k++) {
        const img = await shotAt(page, order[k]);
        if (!img.equals(original[k])) mismatches.push(`y=${order[k]}`);
      }
      expect(mismatches, `frames differing from the original: ${mismatches.join(", ")}`).toEqual([]);

      for (let k = 0; k < order.length; k++) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), order[k]);
        await settle(page);
        expect(Math.abs((await barWidth(page)) - origBars[k])).toBeLessThan(0.5);
      }
    });
  });
}

test.describe("navigation behaviour", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("clicking a nav link scrolls to its panel and marks it current", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await page.getByRole("link", { name: "Work", exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(4 * 900);
    await expect(page.locator("#navLinks a[aria-current='page']")).toHaveText("Work");
    await expect(page.locator("#work")).toHaveAttribute("aria-hidden", "false");
    expect(new URL(page.url()).hash).toBe("#work");
  });

  test("loading with #work in the URL opens that panel", async ({ page }) => {
    await page.goto("/#work");
    await ready(page);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(4 * 900);
    await expect(page.locator("#work")).toHaveAttribute("aria-hidden", "false");
  });

  test("an unknown hash is ignored and does not break the page", async ({ page }) => {
    await page.goto("/#nope");
    await ready(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator("#top")).toHaveAttribute("aria-hidden", "false");
  });

  test("keyboard scrolling drives the stack", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await page.keyboard.press("End");
    await expect(page.locator("#contact")).toHaveAttribute("aria-hidden", "false");
  });

  test("mouse wheel scrolling drives the stack", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 2 * 900);
    await expect(page.locator("#capabilities")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#navLinks a[aria-current='page']")).toHaveText("Focus");
  });

  test("scrolling back up returns focus to earlier panels", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await page.evaluate(() => window.scrollTo({ top: 3 * 900, behavior: "instant" }));
    await expect(page.locator("#stack")).toHaveAttribute("aria-hidden", "false");
    await page.evaluate(() => window.scrollTo({ top: 0.2 * 900, behavior: "instant" }));
    await expect(page.locator("#top")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#stack")).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 640, height: 800 } });

  test("opens, closes with Escape, and closes after choosing a link", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const toggle = page.locator("#menuToggle");
    await toggle.click();
    await expect(page.locator("#navLinks")).toHaveClass(/open/);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("#navLinks")).not.toHaveClass(/open/);
    await toggle.click();
    await page.locator("#navLinks a", { hasText: "About" }).click();
    await expect(page.locator("#navLinks")).not.toHaveClass(/open/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(800);
  });
});

test.describe("touch", () => {
  test.use({ viewport: { width: 640, height: 800 }, hasTouch: true, isMobile: true });

  test("a real touch swipe moves through the panels", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const cdp = await page.context().newCDPSession(page);
    const send = (type: "touchStart" | "touchMove" | "touchEnd", y: number) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: 320, y }] });
    await send("touchStart", 700);
    for (let y = 700; y > 100; y -= 20) {
      await send("touchMove", y);
      await page.waitForTimeout(8);
    }
    await send("touchEnd", 100);
    // Swiping up ~600px (plus momentum) lands on the second panel; the original behaves the same.
    await expect(page.locator("#about")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#top")).toHaveAttribute("aria-hidden", "true");
  });
});
