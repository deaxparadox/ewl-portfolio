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

## Changes made during implementation (recorded after the fact)
- **CSS kept verbatim.** The spec said to drop overridden rules. I copied the whole stylesheet unchanged instead, so the cascade is identical by construction. Pruning dead rules is a separate, optional cleanup (it can be checked with the parity test below).
- **Footer year** is a tiny client component (`Year.tsx`). Next.js 16 refuses to prerender `new Date()`. The original also filled `#year` with JS after load, so this matches it.
- **Test tooling installed** (dev only): `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@playwright/test`. `vite-tsconfig-paths` was installed then removed (Vite handles tsconfig paths itself). `@types/node` was raised from ^20 to ^24 because Vitest 5 needs >=22 and `.nvmrc` is Node 24. Chromium for Playwright lives in `~/.cache/ms-playwright` (not a global npm install).
- **Original kept as a test fixture** at `portfolio/tests/fixtures/original.html`.
- **Parity test method:** `tests/e2e/parity.spec.ts` opens the original file and the Next.js build, forces each of the 7 panels visible the same way on both, takes screenshots with animations disabled, and requires the bytes to be identical. Widths: 1440, 850, 640. A negative test proves the check detects a real change. The active nav link is set by the test on both pages, because that behaviour belongs to FEAT-20261119-1859.

## Test plan result (final)
- Unit/integration (Vitest, 15 tests): run, pass. Command: `npm test`.
- E2E parity (Playwright, 22 tests): run, pass (byte-identical at 1440, 850, 640). Command: `npm run test:e2e`.
- Negative: ran. The parity-detects-a-change test, plus `tests/unit/content-types.test.ts`, which type-checks a deliberately wrong content file and asserts TS2741 (missing `body`) and TS2322 (tags not an array). Written first and seen red, then green after the content types were added.
- Input-variation: ran for unicode, no empty values and no duplicates. **Skipped (approved by you): very long text and empty-list layout tests. Reason: the content is fixed placeholder text that is replaced once with text of similar length, so these cases cannot occur.**
- Lateral/causal check: the same untyped-content gap existed for every list in `content.tsx` (nav, about notes, cards, stack groups, projects, queue rows, steps); all are now typed. No other cause found for the earlier red tests.
- Scroll effect, nav active state and menu toggle are not part of this item (FEAT-20261119-1859).
