import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import PortfolioPage from "@/app/(portfolio)/page";
import { nav, navCta, focus, stack, work, approach, profile } from "@/app/(portfolio)/content";

const SECTION_IDS = ["top", "about", "capabilities", "stack", "work", "approach", "contact"];

function renderPage() {
  return render(<PortfolioPage />).container;
}

describe("portfolio page: integration", () => {
  it("renders the 7 panels in order with the expected ids", () => {
    const c = renderPage();
    const ids = Array.from(c.querySelectorAll("#sectionStage > .panel")).map((p) => p.id);
    expect(ids).toEqual(SECTION_IDS);
  });

  it("every nav link points at an existing panel", () => {
    const c = renderPage();
    const links = Array.from(c.querySelectorAll("[data-panel-link]"));
    expect(links.length).toBeGreaterThanOrEqual(nav.length + 1);
    for (const a of links) {
      const hash = a.getAttribute("href")!;
      expect(SECTION_IDS).toContain(hash.slice(1));
    }
  });

  it("first panel is active and visible to assistive tech, the rest are hidden", () => {
    const c = renderPage();
    const panels = Array.from(c.querySelectorAll("#sectionStage > .panel"));
    expect(panels[0].classList.contains("is-active")).toBe(true);
    expect(panels[0].getAttribute("aria-hidden")).toBe("false");
    for (const p of panels.slice(1)) expect(p.getAttribute("aria-hidden")).toBe("true");
  });

  it("has the progress bar, nav, scroll track and menu toggle shell", () => {
    const c = renderPage();
    expect(c.querySelector("#progress.progress")).not.toBeNull();
    expect(c.querySelector("nav[aria-label='Main navigation']")).not.toBeNull();
    expect(c.querySelector("#scrollTrack")).not.toBeNull();
    const toggle = c.querySelector("#menuToggle")!;
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("portfolio page: sections render their content", () => {
  it("renders every nav label and the CTA", () => {
    const c = renderPage();
    const text = c.querySelector("#navLinks")!.textContent!;
    for (const n of nav) expect(text).toContain(n.label);
    expect(text).toContain(navCta.label);
  });

  it("hero has h1 and both action links", () => {
    const c = renderPage();
    expect(c.querySelector("#top h1")!.textContent).toBe("BUILDINGBEYOND THEOBVIOUS.");
    expect(c.querySelectorAll("#top .hero-actions a").length).toBe(2);
  });

  it("ticker duplicates its group once, the copy is aria-hidden", () => {
    const c = renderPage();
    const groups = c.querySelectorAll("#top .ticker-group");
    expect(groups.length).toBe(2);
    expect(groups[1].getAttribute("aria-hidden")).toBe("true");
  });

  it("focus, stack, work, approach counts match the content file", () => {
    const c = renderPage();
    expect(c.querySelectorAll("#capabilities .cap-card").length).toBe(focus.cards.length);
    expect(c.querySelectorAll("#stack .stack-group").length).toBe(stack.groups.length);
    expect(c.querySelectorAll("#stack .tag").length).toBe(
      stack.groups.reduce((n, g) => n + g.tags.length, 0),
    );
    expect(c.querySelectorAll("#work .project-card").length).toBe(work.projects.length);
    expect(c.querySelector("#work .project-card.wide")).not.toBeNull();
    expect(c.querySelectorAll("#approach .step").length).toBe(approach.steps.length);
  });

  it("each section has exactly one h2 (except hero h1)", () => {
    const c = renderPage();
    for (const id of SECTION_IDS.slice(1)) {
      expect(c.querySelectorAll(`#${id} h2`).length).toBe(1);
    }
  });

  it("contact links use the profile values", () => {
    const c = renderPage();
    const links = Array.from(c.querySelectorAll("#contact a")).map((a) => a.getAttribute("href"));
    expect(links).toContain(`mailto:${profile.email}?subject=Let's%20build%20something`);
    expect(links).toContain(profile.github);
    expect(links).toContain(profile.linkedin);
    const external = Array.from(c.querySelectorAll("#contact a[target='_blank']"));
    for (const a of external) expect(a.getAttribute("rel")).toBe("noreferrer");
  });

  it("footer shows the current year", () => {
    const c = renderPage();
    expect(c.querySelector("#contact footer")!.textContent).toContain(String(new Date().getFullYear()));
  });
});

describe("content file: input variation", () => {
  it("has no empty strings in lists and no duplicate ids/keys", () => {
    for (const card of focus.cards) {
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.body.length).toBeGreaterThan(0);
    }
    const titles = work.projects.map((p) => p.label);
    expect(new Set(titles).size).toBe(titles.length);
    const hrefs = nav.map((n) => n.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("keeps non-ASCII characters intact (unicode)", () => {
    expect(navCta.label).toContain("↗");
    expect(focus.cards[0].icon).toBe("⌘");
    expect(approach.steps[0].symbol).toBe("⌕");
  });
});
