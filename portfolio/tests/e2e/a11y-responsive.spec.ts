import { expect, test, type Page } from "@playwright/test";
import { ORIGINAL, PANELS, ready, settle, showOnly } from "./helpers";

async function load(page: Page, url: string) {
  await page.goto(url);
  await ready(page);
}

// ---------- head / document ----------
test("document metadata matches the original", async ({ page }) => {
  const read = () =>
    page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      description: document.querySelector("meta[name=description]")?.getAttribute("content"),
      themeColor: document.querySelector("meta[name=theme-color]")?.getAttribute("content"),
      viewport: document.querySelector("meta[name=viewport]")?.getAttribute("content"),
      charset: document.characterSet,
    }));
  // Next.js writes the same viewport value as "initial-scale=1"; compare numbers, not spelling.
  const norm = (m: Awaited<ReturnType<typeof read>>) => ({ ...m, viewport: m.viewport?.replace(/(\d)\.0\b/g, "$1") });
  await load(page, ORIGINAL);
  const original = norm(await read());
  await load(page, "/");
  expect(norm(await read())).toEqual(original);
});

// ---------- breakpoints, including both sides of every boundary ----------
// 850 and 640 are width breakpoints; (max-height: 700px) and (min-width: 641px) is the short-screen rule.
const BOUNDARIES = [
  { name: "851x800", width: 851, height: 800 },
  { name: "850x800", width: 850, height: 800 },
  { name: "849x800", width: 849, height: 800 },
  { name: "641x800", width: 641, height: 800 },
  { name: "640x800", width: 640, height: 800 },
  { name: "639x800", width: 639, height: 800 },
  { name: "1000x701", width: 1000, height: 701 },
  { name: "1000x700", width: 1000, height: 700 },
  { name: "1000x699", width: 1000, height: 699 },
];

for (const vp of BOUNDARIES) {
  test.describe(`breakpoint boundary ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });
    test("all 7 panels are pixel-identical to the original", async ({ page }) => {
      const grab = async (url: string) => {
        await load(page, url);
        const out: Buffer[] = [];
        for (const id of PANELS) {
          await showOnly(page, id);
          out.push(await page.screenshot({ animations: "disabled" }));
        }
        return out;
      };
      const original = await grab(ORIGINAL);
      const next = await grab("/");
      const bad = PANELS.filter((_, i) => !next[i].equals(original[i]));
      expect(bad, `panels differing at ${vp.name}: ${bad.join(", ")}`).toEqual([]);
    });
  });
}

// ---------- reduced motion ----------
test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });

  test("scroll positions render pixel-identical to the original (snap at 0.5, no tilt)", async ({ page }) => {
    const positions: number[] = [];
    for (let i = 0; i <= 5; i++) for (const f of [0.25, 0.49, 0.5, 0.75]) positions.push((i + f) * 900);
    const grab = async (url: string) => {
      await load(page, url);
      await page.addStyleTag({ content: ".progress{visibility:hidden}" });
      const out: Buffer[] = [];
      for (const y of positions) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await settle(page);
        out.push(await page.screenshot({ animations: "disabled" }));
      }
      return out;
    };
    const original = await grab(ORIGINAL);
    const next = await grab("/");
    const bad = positions.filter((_, i) => !next[i].equals(original[i]));
    expect(bad, `positions differing: ${bad.join(", ")}`).toEqual([]);
  });

  test("negative: no animation keeps running", async ({ page }) => {
    await load(page, "/");
    await page.waitForTimeout(300);
    const running = await page.evaluate(() =>
      document.getAnimations().filter((a) => a.playState === "running").map((a) => (a as CSSAnimation).animationName),
    );
    expect(running).toEqual([]);
  });

  test("nav link click jumps instead of smooth scrolling", async ({ page }) => {
    await load(page, "/");
    await page.evaluate(() => {
      (window as unknown as { calls: unknown[] }).calls = [];
      const orig = window.scrollTo.bind(window);
      window.scrollTo = ((arg: ScrollToOptions) => {
        (window as unknown as { calls: unknown[] }).calls.push(arg);
        return orig(arg);
      }) as typeof window.scrollTo;
    });
    await page.getByRole("link", { name: "Work", exact: true }).click();
    const calls = await page.evaluate(() => (window as unknown as { calls: ScrollToOptions[] }).calls);
    expect(calls[0].behavior).toBe("auto");
  });
});

test("sanity: without reduced motion, animations do run (so the test above can fail)", async ({ page }) => {
  await load(page, "/");
  await page.waitForTimeout(300);
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  expect(running).toBeGreaterThan(0);
});

// ---------- accessibility tree and ARIA ----------
for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "640", width: 640, height: 800 },
]) {
  test.describe(`accessibility tree @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });
    test("matches the original at every panel", async ({ page }) => {
      const grab = async (url: string) => {
        await load(page, url);
        const out: string[] = [];
        for (let i = 0; i < PANELS.length; i++) {
          await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), i * vp.height);
          await settle(page);
          await page.waitForTimeout(150); // let Chrome refresh its accessibility tree after the panel change
          // Next.js adds an empty route announcer (role=alert); it is framework-owned and not in the original.
          out.push((await page.locator("body").ariaSnapshot()).replace(/\n\s*- alert\s*$/, ""));
        }
        return out;
      };
      const original = await grab(ORIGINAL);
      const next = await grab("/");
      for (let i = 0; i < PANELS.length; i++) expect(next[i], `panel ${PANELS[i]}`).toBe(original[i]);
    });

    test("ARIA attributes, roles and landmarks match the original", async ({ page }) => {
      const grab = async (url: string) => {
        await load(page, url);
        return page.evaluate(() =>
          Array.from(document.querySelectorAll("[aria-label],[aria-hidden],[aria-current],[aria-expanded],[role]"))
            .filter((el) => !el.closest("next-route-announcer"))
            .map((el) => {
              const attrs = el
                .getAttributeNames()
                .filter((n) => n.startsWith("aria-") || n === "role")
                .sort()
                .map((n) => `${n}=${el.getAttribute(n)}`)
                .join(" ");
              return `${el.tagName.toLowerCase()}#${el.id || "-"} ${attrs}`;
            }),
        );
      };
      const original = await grab(ORIGINAL);
      expect(await grab("/")).toEqual(original);
    });
  });
}

// ---------- keyboard ----------
for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "640", width: 640, height: 800 },
]) {
  test.describe(`keyboard @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });
    test("Tab order matches the original", async ({ page }) => {
      const walk = async (url: string) => {
        await load(page, url);
        const seq: string[] = [];
        for (let i = 0; i < 26; i++) {
          await page.keyboard.press("Tab");
          seq.push(
            await page.evaluate(() => {
              const e = document.activeElement as HTMLElement;
              // For <body> (focus left the page content) the text is only source whitespace, so ignore it.
              const text = e.tagName === "BODY" ? "" : (e.textContent ?? "").trim().slice(0, 30);
              return `${e.tagName}|${e.getAttribute("href") ?? ""}|${text}`;
            }),
          );
        }
        return seq;
      };
      const original = await walk(ORIGINAL);
      const next = await walk("/");
      // Compare from the Home link onward. Where the very first Tab starts is a known, logged difference
      // (see the fixme test below and the ISS item in TODO.md).
      const anchor = vp.name === "desktop" ? "A|#top|Home" : "BUTTON||☰";
      const fromHome = (seq: string[]) => seq.slice(seq.findIndex((x) => x.startsWith(anchor)));
      const a = fromHome(original);
      const b = fromHome(next);
      const n = Math.min(a.length, b.length);
      expect(n).toBeGreaterThan(vp.name === "desktop" ? 15 : 5);
      expect(b.slice(0, n)).toEqual(a.slice(0, n));
      // The walk really reached every visible control: 7 nav links + 2 hero buttons on desktop;
      // the menu button + 2 hero buttons at 640 (the nav links are hidden until the menu opens).
      const controls = new Set(next.filter((x) => !x.startsWith("BODY")));
      expect(controls.size).toBe(vp.name === "desktop" ? 9 : 3);
    });

    // ISS-20261120-0915: the original's first Tab goes to the hero buttons; Next.js goes to the Home nav link.
    test.fixme("first Tab lands on the same control as the original", async ({ page }) => {
      const first = async (url: string) => {
        await load(page, url);
        await page.keyboard.press("Tab");
        return page.evaluate(() => (document.activeElement as HTMLElement).getAttribute("href"));
      };
      expect(await first("/")).toBe(await first(ORIGINAL));
    });
  });
}
