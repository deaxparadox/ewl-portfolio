import { describe, expect, it } from "vitest";
import { computeStack } from "@/app/(portfolio)/_lib/stack";

const base = { viewportHeight: 1000, count: 7, innerWidth: 1440, reducedMotion: false };
const at = (frac: number, over: Partial<typeof base> = {}) =>
  computeStack({ ...base, ...over, scrollY: frac * (over.viewportHeight ?? base.viewportHeight) })!;

describe("computeStack", () => {
  it("at the top only the first panel is shown, at rest", () => {
    const r = at(0);
    expect(r.focusIndex).toBe(0);
    expect([...r.panels.keys()]).toEqual([0]);
    const s = r.panels.get(0)!;
    expect(s.zIndex).toBe(1);
    expect(s.pointerEvents).toBe(true);
    expect(s.filter).toBe("brightness(1) saturate(1)");
    expect(r.percentage).toBe(0);
  });

  it("halfway through a panel the incoming one takes focus and pointer events", () => {
    const r = at(0.5);
    expect(r.focusIndex).toBe(1);
    expect([...r.panels.keys()].sort()).toEqual([0, 1]);
    expect(r.panels.get(0)!.pointerEvents).toBe(false);
    expect(r.panels.get(1)!.pointerEvents).toBe(true);
    expect(r.panels.get(1)!.zIndex).toBe(3);
  });

  it("flips focus exactly at p = 0.5 (boundary)", () => {
    expect(at(0.4999).focusIndex).toBe(0);
    expect(at(0.5).focusIndex).toBe(1);
  });

  it("does not show the incoming panel until p > 0.0005", () => {
    expect(at(0.0005).panels.has(1)).toBe(false);
    expect(at(0.0006).panels.has(1)).toBe(true);
  });

  it("incoming panel starts lifted/smaller and ends in place at full size", () => {
    const early = at(0.25).panels.get(1)!;
    expect(early.transform).toContain("translate3d(0, 540px, 0)"); // (1-.25)*1000*.72
    expect(early.transform).toContain("scale(0.88)"); // .84 + .16*.25
    const done = at(1); // exactly one panel in: panel 1 rests in place, panel 2 not shown yet
    expect(done.panels.has(2)).toBe(false);
    expect(done.panels.get(1)!.transform).toBe("translate3d(0, 0px, 0) scale(1)");
    const next = at(1.0006).panels.get(2)!;
    expect(next.pointerEvents).toBe(false);
  });

  it("clamps scroll below 0 and above the end", () => {
    const top = computeStack({ ...base, scrollY: -500 })!;
    expect(top.focusIndex).toBe(0);
    const end = computeStack({ ...base, scrollY: 99999 })!;
    expect(end.focusIndex).toBe(6);
    expect(end.percentage).toBe(100);
    const inc = end.panels.get(6)!;
    expect(inc.transform).toBe("perspective(1500px) translate3d(0, 0px, 0) scale(1) rotateX(0deg)");
    expect(end.panels.get(5)).toBeDefined();
  });

  it("percentage is position / (count - 1)", () => {
    expect(at(3).percentage).toBeCloseTo(50);
    expect(at(1.5).percentage).toBeCloseTo(25);
  });

  it("uses the smaller radius on narrow screens (640 and below)", () => {
    const wide = at(0.25, { innerWidth: 641 }).panels.get(1)!.borderRadius;
    const narrow = at(0.25, { innerWidth: 640 }).panels.get(1)!.borderRadius;
    expect(wide).toBe(`${0.75 * 27}px`); // 641 is NOT narrow: original uses `< 641`
    expect(narrow).toBe(`${0.75 * 19}px`);
    expect(at(0.25, { innerWidth: 1440 }).panels.get(1)!.borderRadius).toBe(`${0.75 * 27}px`);
  });

  it("reduced motion snaps at 0.5 and never tilts", () => {
    const before = at(0.3, { reducedMotion: true }).panels.get(1)!;
    expect(before.transform).toContain("translate3d(0, 720px, 0)"); // eased 0 -> full lift
    expect(before.transform).toContain("rotateX(0deg)");
    const after = at(0.5, { reducedMotion: true }).panels.get(1)!;
    expect(after.transform).toContain("translate3d(0, 0px, 0)");
  });

  it("handles one panel and two panels without throwing", () => {
    const one = computeStack({ ...base, count: 1, scrollY: 400 })!;
    expect(one.focusIndex).toBe(0);
    expect(one.percentage).toBe(100);
    expect([...one.panels.keys()]).toEqual([0]);
    const two = computeStack({ ...base, count: 2, scrollY: 500 })!;
    expect(two.focusIndex).toBe(1);
    expect([...two.panels.keys()].sort()).toEqual([0, 1]);
  });

  it("returns null for zero panels", () => {
    expect(computeStack({ ...base, count: 0, scrollY: 0 })).toBeNull();
  });

  it.each([1, 100, 320, 5000])("works for viewport height %i", (h) => {
    const r = computeStack({ ...base, viewportHeight: h, scrollY: h * 2.5 })!;
    expect(r.focusIndex).toBe(3);
  });
});
