import { computeStack, type PanelStyle } from "./stack";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Writes only the CSS properties that changed since the last frame.
function applyStyle(panel: HTMLElement, prev: PanelStyle | null, next: PanelStyle | null) {
  if (!next) {
    panel.classList.remove("is-visible");
    panel.removeAttribute("style"); // falls back to the stylesheet: hidden, resting transform
    return;
  }
  panel.classList.add("is-visible");
  const s = panel.style;
  if (prev?.zIndex !== next.zIndex) s.zIndex = String(next.zIndex);
  if (prev?.pointerEvents !== next.pointerEvents) s.pointerEvents = next.pointerEvents ? "auto" : "none";
  if (prev?.transform !== next.transform) s.transform = next.transform;
  if (prev?.transformOrigin !== next.transformOrigin) s.transformOrigin = next.transformOrigin;
  if (prev?.borderRadius !== next.borderRadius) s.borderRadius = next.borderRadius;
  if (prev?.boxShadow !== next.boxShadow) s.boxShadow = next.boxShadow;
  if (prev?.filter !== next.filter) s.filter = next.filter;
  if (prev?.opacity !== next.opacity) s.opacity = next.opacity;
}

/**
 * Scroll-linked section stack: panels, progress bar, active nav link, URL hash and menu toggle.
 * Everything is driven by direct DOM writes in one requestAnimationFrame per scroll burst (no React state).
 * Returns a cleanup function that removes every listener.
 */
export function initScrollStack(doc: Document, win: Window): () => void {
  const stage = doc.getElementById("sectionStage");
  const panels = stage ? Array.from(stage.querySelectorAll<HTMLElement>(":scope > .panel")) : [];
  if (!stage || panels.length === 0) return () => {};

  const track = doc.getElementById("scrollTrack")!;
  const progress = doc.getElementById("progress")!;
  const navLinks = doc.getElementById("navLinks")!;
  const menuToggle = doc.getElementById("menuToggle")!;
  const navItems = Array.from(doc.querySelectorAll<HTMLElement>("[data-panel-link]")).map((el) => ({
    el,
    hash: el.getAttribute("href"),
    inMenu: !!el.closest(".nav-links"),
  }));
  const panelIndex = new Map(panels.map((p, i) => [p.id, i]));
  const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let viewportHeight = win.innerHeight;
  let lastFocus = -1;
  let lastProgress = "";
  let frame = 0;
  let applied: (PanelStyle | null)[] = panels.map(() => null);

  const setTrackSize = () => {
    track.style.height = `${panels.length * viewportHeight}px`;
  };

  function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }

  function setFocus(index: number) {
    if (index === lastFocus) return;
    if (lastFocus >= 0) {
      panels[lastFocus].classList.remove("is-active");
      panels[lastFocus].setAttribute("aria-hidden", "true");
    }
    lastFocus = index;
    panels[index].classList.add("is-active");
    panels[index].setAttribute("aria-hidden", "false");

    const activeHash = `#${panels[index].id}`;
    for (const { el, hash, inMenu } of navItems) {
      const selected = hash === activeHash;
      el.classList.toggle("active", selected);
      if (selected && inMenu) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    }
    if (win.location.hash !== activeHash) {
      try {
        win.history.replaceState(null, "", `${win.location.pathname}${win.location.search}${activeHash}`);
      } catch {
        // Embedded previews can have an opaque origin; scrolling still works without URL syncing.
      }
    }
  }

  function render() {
    frame = 0;
    const r = computeStack({
      scrollY: win.scrollY,
      viewportHeight,
      count: panels.length,
      innerWidth: win.innerWidth,
      reducedMotion,
    })!;
    // Only panels shown last frame or this frame can need a write.
    const next = panels.map((_, i) => r.panels.get(i) ?? null);
    next.forEach((style, i) => {
      if (style || applied[i]) applyStyle(panels[i], applied[i], style);
    });
    applied = next;
    setFocus(r.focusIndex);
    const bar = `scaleX(${r.percentage / 100})`;
    if (bar !== lastProgress) {
      lastProgress = bar;
      progress.style.transform = bar;
    }
  }

  const requestRender = () => {
    if (!frame) frame = win.requestAnimationFrame(render);
  };

  function goToPanel(index: number) {
    closeMenu();
    win.scrollTo({
      top: clamp(index, 0, panels.length - 1) * viewportHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  // One delegated listener covers every in-page link, including links inside panels.
  const onClick = (event: Event) => {
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
    const hash = link?.getAttribute("href");
    if (!hash || hash.length < 2) return;
    const index = panelIndex.get(hash.slice(1));
    if (index === undefined) return;
    event.preventDefault();
    goToPanel(index);
  };

  const onToggle = () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
  };

  const onResize = () => {
    const oldHeight = Math.max(1, parseFloat(track.dataset.viewportHeight || String(viewportHeight)));
    const position = win.scrollY / oldHeight;
    viewportHeight = win.innerHeight;
    setTrackSize();
    track.dataset.viewportHeight = String(viewportHeight);
    win.scrollTo({ top: clamp(position, 0, panels.length - 1) * viewportHeight, behavior: "auto" });
    closeMenu();
    requestRender();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const t = event.target as HTMLElement | null;
    if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
    if (event.key === "Escape") closeMenu();
  };

  // Server HTML marks the first panel active; normalise so setFocus owns the state from here on.
  panels.forEach((p) => {
    p.classList.remove("is-active");
    p.setAttribute("aria-hidden", "true");
  });

  doc.addEventListener("click", onClick);
  menuToggle.addEventListener("click", onToggle);
  win.addEventListener("scroll", requestRender, { passive: true });
  win.addEventListener("resize", onResize, { passive: true });
  doc.addEventListener("keydown", onKey);

  setTrackSize();
  track.dataset.viewportHeight = String(viewportHeight);
  const initialIndex = panelIndex.get(win.location.hash.slice(1)) ?? 0;
  win.scrollTo({ top: initialIndex * viewportHeight, behavior: "auto" });
  render();

  return () => {
    if (frame) win.cancelAnimationFrame(frame);
    doc.removeEventListener("click", onClick);
    menuToggle.removeEventListener("click", onToggle);
    win.removeEventListener("scroll", requestRender);
    win.removeEventListener("resize", onResize);
    doc.removeEventListener("keydown", onKey);
  };
}
