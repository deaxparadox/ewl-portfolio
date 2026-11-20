// Pure math for the scroll-linked section stack. Formulas are copied unchanged from the original
// portfolio HTML (`renderStack`), so the look is identical; no DOM access here.

export type PanelStyle = {
  zIndex: number;
  pointerEvents: boolean;
  transform: string;
  transformOrigin: string;
  borderRadius: string;
  boxShadow: string;
  filter: string;
  opacity: string;
};

export type StackInput = {
  scrollY: number;
  viewportHeight: number;
  count: number;
  innerWidth: number;
  reducedMotion: boolean;
};

export type StackResult = {
  focusIndex: number;
  /** Scroll position in panel units, 0..count-1. */
  position: number;
  /** position / (count - 1) as a percentage. */
  percentage: number;
  /** Only the panels that should be visible this frame (outgoing, and incoming once p > 0.0005). */
  panels: Map<number, PanelStyle>;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function computeStack({ scrollY, viewportHeight, count, innerWidth, reducedMotion }: StackInput): StackResult | null {
  if (count < 1) return null;
  const max = count - 1;
  const position = clamp(scrollY / viewportHeight, 0, max);
  const baseIndex = Math.min(Math.floor(position), Math.max(0, count - 2));
  const raw = count === 1 ? 0 : position >= max ? 1 : position - baseIndex;
  const p = clamp(raw, 0, 1);
  // Movement is proportional to the scroll distance, except with reduced motion where it snaps at 0.5.
  const eased = reducedMotion ? (p >= 0.5 ? 1 : 0) : p;
  const incomingIndex = Math.min(baseIndex + 1, max);
  const focusIndex = p >= 0.5 ? incomingIndex : baseIndex;
  const panels = new Map<number, PanelStyle>();

  // The current sheet recedes a little, making room for the sheet above it.
  panels.set(baseIndex, {
    zIndex: 1,
    pointerEvents: p < 0.5,
    transform: `translate3d(0, ${-viewportHeight * 0.018 * eased}px, 0) scale(${1 - 0.055 * eased})`,
    transformOrigin: "50% 100%",
    borderRadius: `${24 * eased}px`,
    boxShadow: "none",
    filter: `brightness(${1 - 0.13 * eased}) saturate(${1 - 0.06 * eased})`,
    opacity: "1",
  });

  if (incomingIndex !== baseIndex && p > 0.0005) {
    // The incoming section is a full viewport-sized sheet that lifts from below and expands.
    const lift = (1 - eased) * viewportHeight * 0.72;
    const scale = 0.84 + 0.16 * eased;
    const tilt = reducedMotion ? 0 : (1 - eased) * 2.8;
    const radius = (1 - eased) * (innerWidth < 641 ? 19 : 27);
    const shadowBlur = 26 + (1 - eased) * 42;
    panels.set(incomingIndex, {
      zIndex: 3,
      pointerEvents: p >= 0.5,
      transform: `perspective(1500px) translate3d(0, ${lift}px, 0) scale(${scale}) rotateX(${tilt}deg)`,
      transformOrigin: "50% 100%",
      borderRadius: `${radius}px`,
      boxShadow: `0 22px ${shadowBlur}px rgba(0, 0, 0, ${(1 - eased) * 0.38})`,
      filter: "none",
      opacity: "1",
    });
  }

  return { focusIndex, position, percentage: count > 1 ? (position / max) * 100 : 100, panels };
}
