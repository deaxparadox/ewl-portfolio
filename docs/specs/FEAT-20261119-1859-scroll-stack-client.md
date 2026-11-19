# FEAT-20261119-1859 — Scroll-stacking client component

Branch: `master`. Depends on FEAT-20261119-1858.

## What is being built
One small client component that reproduces the HTML's scroll-linked section stacking, progress bar, active nav link, hash sync, smooth nav-link scroll, and mobile menu toggle. Same look as the HTML. Speed comes only from the implementation.

## Verified current state (read from the HTML script)
- A 1-px `#scrollTrack` sets scroll length to `panels × innerHeight`. `renderStack` runs in `requestAnimationFrame` on scroll.
- Each frame it resets ALL panels via inline styles, then shows the outgoing and incoming panels with transform, border-radius, box-shadow, and filter (brightness/saturate).
- It also writes the progress bar width, toggles `.active` / `aria-current` on nav links, `aria-hidden` on panels, and calls `history.replaceState` when the active panel changes.
- Resize keeps the normalized scroll position. `Escape` closes the menu. Initial hash selects the first panel.

## Design (look unchanged; implementation changes only)
- Panels and nav stay server-rendered. The client component receives refs by `id`/data attributes, no React state for scroll.
- Scroll handler uses passive listener + `requestAnimationFrame`, writes styles directly to the DOM, and only touches the panels whose state actually changes (outgoing, incoming, and the previous pair), not all 7 each frame.
- Cache panel elements and viewport height once; update on resize only.
- `will-change` and `contain` on panels for GPU compositing; the noise layer is on its own compositing layer. Blur/brightness/shadow stay as in the HTML.
- First panel visible in server HTML so first paint does not wait for JS.
- Same cubic-feel: progress mapping, scale, lift, tilt, radius, shadow values copied from the HTML script unchanged.
- Off-screen CSS animations (orbit, ticker, float) pause when their panel is not active; no visual difference.
- Listeners removed on unmount; no memory leaks.

## Test plan
- Unit: pure function that maps scroll position to per-panel style values (position, p, eased, focus index), tested against values computed from the HTML's formulas. Tooling per FEAT-20261119-1858 decision.
- Integration: component with the real 7 panels in jsdom: scroll events update active panel, nav link `aria-current`, progress width, hash.
- E2E (Playwright): scroll to 0, 0.25, 0.5, 0.75, 1 of each panel boundary and compare screenshots with the HTML original; click each nav link and verify target; menu toggle at 640px; initial `#work` hash loads that panel.
- Negative: unknown hash is ignored; missing panel set (0 or 1 panel) does not throw.
- Input-variation: very small/large viewport heights, resize mid-scroll, rapid scroll, hash with unicode.
- Real-world: dev server in a real browser, scroll with wheel, keyboard and touch emulation.
- Performance: handled in EXP-20261119-1901.
