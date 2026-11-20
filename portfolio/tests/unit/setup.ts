// jsdom lacks these browser APIs; default stubs so any test can render the page.
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }),
});
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
