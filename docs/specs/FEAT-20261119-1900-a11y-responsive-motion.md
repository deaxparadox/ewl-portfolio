# FEAT-20261119-1900 — Accessibility, responsive, reduced motion parity

Branch: `master`. Depends on FEAT-20261119-1859.

## What is being built
Make sure the Next.js page behaves exactly like the HTML for accessibility, breakpoints, and reduced motion. This is parity, not redesign. The tiny mobile text stays as in the HTML.

## Verified current state (read from the HTML)
- Breakpoints: 850px, 640px, and `max-height: 700px` with `min-width: 641px`.
- ARIA: `aria-label` on nav, main, hero art, ticker; `aria-hidden` toggled on panels; `aria-current="page"` on the active nav link; `aria-expanded` on the menu toggle; duplicate ticker group marked `aria-hidden`.
- Reduced motion: animations/transitions near zero, panel position snaps at 0.5 progress, tilt removed.
- Markup is semantic (`header`, `main`, `section`, `article`, `h1`/`h2`/`h3`, `nav`).

## Design
- Copy all media queries and ARIA rules into the converted CSS and components; compare against the HTML at each breakpoint.
- Any difference found between the HTML and the build is logged as its own item (Module 7), not silently changed.
- Anything that is an accessibility weakness in the HTML itself (for example small text, contrast) is reported to you as a finding and left unchanged unless you ask.

## Test plan
- Unit: reduced-motion branch of the scroll mapping function (snaps at 0.5, tilt 0).
- Integration: ARIA attributes update with the active panel; menu toggle updates `aria-expanded`.
- E2E (Playwright): screenshots at 1440, 850, 640, and 700px-tall landscape, compared with the HTML; reduced-motion emulation; keyboard Tab order and Escape closing the menu.
- Negative: reduced motion on, no animation runs.
- Input-variation: widths at each breakpoint boundary (849/850/851, 640/641), heights around 700.
- Real-world: manual check in a real browser, including a screen reader smoke test if available.

## What the checks found and fixed (recorded after the fact)
Real differences from the original, found by the parity tests and fixed at the cause:
1. **Reduced motion: panel edges rendered slightly differently.** The original turns `will-change` off for reduced motion; my speed CSS (FEAT-20261119-1859) turned it back on for visible panels. Fixed with a reduced-motion rule after it. Lateral check: no other rule of mine overrides a reduced-motion rule from the original.
2. **One glyph in the About paragraph was nudged by a sub-pixel at width 641.** React split the paragraph into several text nodes; the original has one. Fixed by writing each text run as one string. Lateral check: the same pattern existed in the email button and the footer line; both fixed. No other `{" "}`-style splits remain in the components.

Differences that are not defects (framework output), left as they are:
- Next.js writes the viewport meta as `initial-scale=1`; the original has `1.0`. Same meaning.
- Next.js adds an empty route announcer (role=alert) to the page. The tests ignore it.

Open difference, logged for your decision: **ISS-20261120-0915** (the first Tab lands on the Home nav link in the Next.js build, but on the hero buttons in the original). The order of controls after that is identical. The test for it is marked `fixme` with that ID.

## Test plan result
- Unit: reduced-motion branch of the scroll math (in FEAT-20261119-1859's `stack.test.ts`, 15 tests). Run, pass.
- Integration: ARIA attributes follow the active panel; menu toggle updates `aria-expanded` (in `scroll-stack.test.tsx`). Run, pass.
- E2E (Playwright, real Chromium), file `tests/e2e/a11y-responsive.spec.ts`:
  - document metadata (lang, title, description, theme colour, viewport, charset) matches. Pass.
  - pixel-identical screenshots of all 7 panels at 851/850/849, 641/640/639 wide (800 tall) and 701/700/699 tall (1000 wide). Pass.
  - reduced motion: pixel-identical at 24 scroll positions (snap at 0.5, none tilting); nav click jumps instead of smooth scrolling. Pass.
  - accessibility tree (Chrome ARIA snapshot) identical to the original at every panel, at 1440 and 640 wide; every aria-* attribute and role identical. Pass.
  - Tab order identical from the first nav control onward, at 1440 and 640 wide; Escape closing the menu (in `scroll.spec.ts`). Pass.
- Negative: with reduced motion on, no animation keeps running (and a sanity test proves animations do run otherwise). Pass.
- Input-variation: both sides of every breakpoint (849/850/851, 639/640/641, heights 699/700/701). Pass.
- Real-world: a real browser against the production build (above). **Screen reader smoke test: NOT run** (no screen reader available here); the Chrome accessibility tree comparison is the closest substitute and is not the same thing.
- Flakiness: the first run had one random mismatch (1000x701) that did not come back in 5 further runs; the accessibility tree is now read 150 ms after a panel change because Chrome refreshes it lazily.
