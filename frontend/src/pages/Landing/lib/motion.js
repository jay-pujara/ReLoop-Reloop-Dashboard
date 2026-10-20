/** Shared motion tokens. Every animated component reads from here. */

export const EASE_OUT = [0.16, 1, 0.3, 1];

/** Weighted spring for scroll-linked values — never snapped to the scrollbar. */
export const STAGE_SPRING = { stiffness: 120, damping: 30, mass: 0.6 };

/** Softer spring for counters and readouts. */
export const READOUT_SPRING = { stiffness: 90, damping: 26, mass: 0.8 };

export const LINE_REVEAL = { duration: 0.9, ease: EASE_OUT };

export const LINE_STAGGER = 0.08;

export const VIEWPORT_ONCE = { once: true, margin: "-20% 0px" };

export const LENIS_OPTIONS = {
  lerp: 0.09,
  wheelMultiplier: 1,
  syncTouch: false,
};
