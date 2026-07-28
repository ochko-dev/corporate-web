/**
 * Content and scroll-choreography constants for the cinematic About section.
 *
 * The logo cluster is already fully formed by the time the section is
 * reached, so the section's whole pin scroll drives a single GSAP timeline
 * across `TIMELINE_LENGTH` abstract units (treated as percent-of-sequence):
 * the intro types in early and stays on screen, then the vision items reveal
 * one at a time across the rest.
 */
const CONTENT_PERCENT = 400;

export const PIN_DISTANCE = `+=${CONTENT_PERCENT}%`;

export const TIMELINE_LENGTH = 100;

export const ABOUT_PHASES = {
  labelIn: 0,
  typingStart: 4,
  typingEnd: 20,
  cardsStart: 26,
  cardsEnd: 96,
} as const;
