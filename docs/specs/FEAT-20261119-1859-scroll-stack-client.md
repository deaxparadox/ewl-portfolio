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

## Changes made during implementation (recorded after the fact)
- **Files:** `_lib/stack.ts` (pure math, formulas copied from the original), `_lib/scrollStack.ts` (DOM wiring, one function that returns a cleanup), `_components/ScrollStack.tsx` (renders nothing, calls it in an effect), plus a short block at the end of `portfolio.css`.
- **Per frame it only writes the two moving panels** (and clears the ones that just left), and only the CSS properties whose value changed. The original reset all 7 panels every frame.
- **Progress bar** now moves with `transform: scaleX()` instead of `width`. Same look; the test hides the bar for pixel comparison and checks its width separately (within 0.5px of the original at every position).
- **`will-change`** is now only on visible panels (original: all 7 permanently).
- **Decorative loops** (orbit, ticker, float, pulse) pause on panels that are not on screen.
- **`contain` was NOT added** (the design section listed it). Reason: no measured benefit yet, and it risks clipping; EXP-20261119-1901 will show whether it is worth trying.
- **Everything else is as in the original:** same scroll math, hash sync, smooth nav scroll, resize behaviour, Escape handling, menu toggle.
- **Two test-side lessons:** tests must wait for the script to start (it resets scroll to the hash panel on load, like the original); and synthesized Chrome scroll gestures do nothing on either page, so the touch test sends real touch events.

## Test plan result (final)
- Unit (Vitest): `computeStack` (15 tests): boundaries at p=0.5 and 0.0005, clamping, percentage, narrow-screen radius (`< 641`), reduced motion, 0/1/2 panels, viewport heights 1/100/320/5000. Run, pass.
- Integration (Vitest + jsdom, 14 tests): the real page. Active panel, aria, nav, progress, URL hash, only two panels visible, one frame per scroll burst, nav and in-panel links, menu toggle and Escape, load with hash, resize, cleanup on unmount. Run, pass.
- E2E (Playwright, real Chromium, 32 tests total with the section tests): every scroll position (4 steps per panel boundary, to the end and back up) at 1440 and 640 widths gives a screenshot byte-identical to the original; nav click, load with `#work`, unknown hash, keyboard, mouse wheel, touch swipe, scroll back up, mobile menu. Run, pass, twice in a row.
- Negative: unknown/empty/unicode hashes ignored, 0 panels, missing stage, listeners removed on unmount. Run, pass.
- Input-variation: viewport heights, resize mid-scroll, 50 rapid scroll events, hash with unicode. Run, pass.
- Real-world: a real browser against the production build with wheel, keyboard and touch events. Done.
- Not part of this item: speed measurement (EXP-20261119-1901). Reduced-motion and breakpoint parity (FEAT-20261119-1900).
- Lateral check: the one-panel-per-frame and cleanup logic applies to every panel the same way (no per-section code). Causal check: the original's per-frame full reset was the only extra per-frame cost found in its script; the CSS costs were `will-change` on all panels and `width` on the progress bar, both addressed.
