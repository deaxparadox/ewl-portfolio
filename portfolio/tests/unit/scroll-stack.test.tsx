import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import PortfolioPage from "@/app/(portfolio)/page";
import { initScrollStack } from "@/app/(portfolio)/_lib/scrollStack";

const VH = 1000;
let rafQueue: FrameRequestCallback[] = [];

function setScroll(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
}
function flushFrames() {
  const q = rafQueue;
  rafQueue = [];
  q.forEach((cb) => cb(0));
}
function scrollTo(y: number) {
  setScroll(y);
  window.dispatchEvent(new Event("scroll"));
  flushFrames();
}
const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
const panelOf = (id: string) => document.getElementById(id) as HTMLElement;
const navLink = (hash: string) => document.querySelector(`#navLinks a[href='${hash}']`) as HTMLElement;

beforeEach(() => {
  rafQueue = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => rafQueue.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(window, "innerHeight", { configurable: true, value: VH });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
  window.history.replaceState(null, "", "/");
  setScroll(0);
  (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("scroll stack: integration with the real page", () => {
  it("starts on Home: hero active, Home link current, progress at 0", () => {
    render(<PortfolioPage />);
    expect(panelOf("top").classList.contains("is-active")).toBe(true);
    expect(navLink("#top").getAttribute("aria-current")).toBe("page");
    expect(navLink("#top").classList.contains("active")).toBe(true);
    expect($("#progress").style.transform).toBe("scaleX(0)");
  });

  it("scrolling updates the active panel, aria, nav, progress and URL hash", () => {
    render(<PortfolioPage />);
    scrollTo(1.6 * VH);
    expect(panelOf("capabilities").getAttribute("aria-hidden")).toBe("false");
    expect(panelOf("capabilities").classList.contains("is-active")).toBe(true);
    expect(panelOf("top").getAttribute("aria-hidden")).toBe("true");
    expect(navLink("#capabilities").getAttribute("aria-current")).toBe("page");
    expect(navLink("#top").getAttribute("aria-current")).toBeNull();
    expect(parseFloat($("#progress").style.transform.replace("scaleX(", ""))).toBeCloseTo(1.6 / 6, 5);
    expect(window.location.hash).toBe("#capabilities");
  });

  it("only the outgoing and incoming panels are visible; earlier ones are cleaned up", () => {
    render(<PortfolioPage />);
    scrollTo(0.5 * VH);
    expect(document.querySelectorAll("#sectionStage > .is-visible").length).toBe(2);
    scrollTo(4.5 * VH);
    const visible = Array.from(document.querySelectorAll("#sectionStage > .is-visible")).map((p) => p.id);
    expect(visible).toEqual(["work", "approach"]);
    expect(panelOf("top").style.transform).toBe("");
    expect(panelOf("top").style.zIndex).toBe("");
  });

  it("coalesces many scroll events into one frame", () => {
    render(<PortfolioPage />);
    rafQueue = [];
    for (let i = 1; i <= 50; i++) {
      setScroll(i * 10);
      window.dispatchEvent(new Event("scroll"));
    }
    expect(rafQueue.length).toBe(1);
  });

  it("nav links scroll smoothly to their panel and close the menu", () => {
    render(<PortfolioPage />);
    $("#menuToggle").click();
    const a = navLink("#work");
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    a.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 4 * VH, behavior: "smooth" });
    expect($("#navLinks").classList.contains("open")).toBe(false);
  });

  it("links inside panels (back to top) use the same stack", () => {
    render(<PortfolioPage />);
    const back = document.querySelector("a.back-top") as HTMLElement;
    back.click();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("menu toggle opens, updates aria-expanded and the icon, then closes", () => {
    render(<PortfolioPage />);
    const t = $("#menuToggle");
    t.click();
    expect($("#navLinks").classList.contains("open")).toBe(true);
    expect(t.getAttribute("aria-expanded")).toBe("true");
    expect(t.textContent).toBe("×");
    t.click();
    expect($("#navLinks").classList.contains("open")).toBe(false);
    expect(t.getAttribute("aria-expanded")).toBe("false");
    expect(t.textContent).toBe("☰");
  });

  it("Escape closes the menu; Escape with Ctrl held does not", () => {
    render(<PortfolioPage />);
    $("#menuToggle").click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", ctrlKey: true }));
    expect($("#navLinks").classList.contains("open")).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect($("#navLinks").classList.contains("open")).toBe(false);
  });

  it("loads on the panel named by the URL hash", () => {
    window.history.replaceState(null, "", "/#work");
    render(<PortfolioPage />);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 4 * VH, behavior: "auto" });
  });

  it("resize keeps the scroll position in panel units and resizes the track", () => {
    render(<PortfolioPage />);
    setScroll(2.5 * VH);
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 500 });
    window.dispatchEvent(new Event("resize"));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 2.5 * 500, behavior: "auto" });
    expect($("#scrollTrack").style.height).toBe("3500px");
  });

  it("removes its listeners when unmounted", () => {
    const { unmount } = render(<PortfolioPage />);
    unmount();
    // Re-add the DOM pieces the handlers would touch and make sure nothing reacts.
    const bar = document.createElement("div");
    bar.id = "progress";
    document.body.append(bar);
    scrollTo(3 * VH);
    expect(bar.style.transform).toBe("");
    expect(rafQueue.length).toBe(0);
    bar.remove();
  });
});

describe("scroll stack: negative and input variation", () => {
  it.each(["#nope", "#é", "#", "#top?x=1"])("ignores in-page link %s that matches no panel", (href) => {
    render(<PortfolioPage />);
    const a = document.createElement("a");
    a.href = href;
    a.setAttribute("href", href);
    document.body.append(a);
    (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    a.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
    expect(window.scrollTo).not.toHaveBeenCalled();
    a.remove();
  });

  it("does nothing, and does not throw, when there are no panels", () => {
    document.body.innerHTML = '<main id="sectionStage"></main>';
    expect(() => initScrollStack(document, window)()).not.toThrow();
  });

  it("does nothing when the stage is missing", () => {
    document.body.innerHTML = "";
    expect(() => initScrollStack(document, window)()).not.toThrow();
  });

  it("works with a single panel", () => {
    document.body.innerHTML =
      '<div id="progress"></div><div id="navLinks"></div><button id="menuToggle"></button>' +
      '<main id="sectionStage"><section class="panel" id="only"></section></main><div id="scrollTrack"></div>';
    const stop = initScrollStack(document, window);
    scrollTo(5 * VH);
    expect(document.getElementById("only")!.classList.contains("is-active")).toBe(true);
    stop();
  });
});
