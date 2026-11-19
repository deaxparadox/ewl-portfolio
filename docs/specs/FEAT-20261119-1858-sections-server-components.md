# FEAT-20261119-1858 — Convert sections to server components

Branch: `master`. Depends on FEAT-20261119-1857.

## What is being built
The 7 sections of `portfolio (10).html` as React server components under `app/(portfolio)/`, with the page text in one data file (`content.ts`). Visuals must match the HTML exactly.

## Verified current state (read from the HTML)
- Sections: hero+ticker (`#top`), About, Focus (`#capabilities`), Stack, Work (`#work`), Approach, Contact (`#contact`), plus fixed nav and progress bar.
- CSS: ~630 lines, three stacked override layers. Final computed look comes from the last layer, so conversion must resolve the cascade, not copy rules blindly. Every rule that is overridden and never wins is dropped; every rule that wins is kept. This is checked by screenshot comparison, not by eye.
- Fonts: `Inter` is named but never loaded. Spec: no font loading; the same system font stack.
- Placeholders ("YOUR NAME", `hello@yourdomain.com`, social links) stay as they are; the real values come later through `content.ts`.
- The `body::before` noise texture is an inline SVG data URI; kept visually identical.

## Design
- One `globals.css` for the portfolio group (tokens, layout, panels), plus CSS Modules or plain scoped class names per section (decided at implementation, whichever keeps the cascade result identical).
- `content.ts` holds all text, links, and lists. Components map over it.
- All sections are server components. The year in the footer is rendered on the server.
- Static output: no data fetching, page prerenders at build.

## Test plan
- Unit: component render tests for each section (text from `content.ts` appears, correct tags/ids). Tooling: needs your choice (see below).
- Integration: page assembles all 7 sections in order with correct `id`s; nav hrefs each match a section id.
- E2E: browser at 3 widths (desktop, 850px, 640px) screenshot each section and compare with the HTML original, pixel diff with a tolerance, all other effects off during compare.
- Negative: content file missing a required field fails type-check / build.
- Input-variation: empty list, very long text, and unicode in `content.ts` do not break the layout (render tests).
- Real-world: dev server in browser, side-by-side with the HTML file.

## Test tooling — your choice needed
No test tooling exists in the project. Options with trade-offs:
1. **Vitest + React Testing Library (unit/integration) + Playwright (E2E, screenshots).** Standard for Next.js, Next's docs cover both. Adds dev dependencies only.
2. Jest + RTL + Playwright. Works but needs more Next-specific config than Vitest.
3. Playwright only. Fewest dependencies; no fast unit level.
Recommended: option 1.
