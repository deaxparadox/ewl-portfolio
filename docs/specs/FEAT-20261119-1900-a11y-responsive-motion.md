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
