/**
 * Content and scroll-choreography constants for the cinematic About section.
 * AboutSection pins the section and scrubs a single GSAP timeline across
 * `TIMELINE_LENGTH` abstract units (treated as percent-of-sequence) against
 * scroll distance `PIN_DISTANCE`. Every stage below is a position on that
 * 0–100 timeline: the intro types in early and stays on screen, then the
 * vision items reveal one at a time across the rest of the pin.
 */
export const PIN_DISTANCE = "+=400%";
export const TIMELINE_LENGTH = 100;

export const ABOUT_PHASES = {
  labelIn: 0,
  typingStart: 4,
  typingEnd: 20,
  cardsStart: 26,
  cardsEnd: 96,
} as const;
