"use client";

import { forwardRef } from "react";

/**
 * Renders each paragraph twice: a real, fully-visible copy for accessibility
 * (screen readers, text selection, no-JS), and a decorative character-split
 * copy the master GSAP timeline drives opacity on to produce the scroll-scrubbed
 * typewriter effect. AboutSection queries `.about-char` inside the returned
 * ref to build that stagger tween — no per-character React state, so typing
 * costs nothing beyond the initial split.
 */
export const AboutIntroduction = forwardRef<HTMLDivElement, { paragraphs: readonly string[] }>(
  function AboutIntroduction({ paragraphs }, ref) {
    return (
      <div ref={ref} className="max-w-3xl space-y-6">
        <span className="sr-only">{paragraphs.join(" ")}</span>
        {paragraphs.map((paragraph, pi) => (
          <p
            key={pi}
            aria-hidden
            className="text-xl leading-[1.7] font-light text-foreground/85 sm:text-2xl"
          >
            {paragraph.split(" ").map((word, wi, words) => (
              <span key={wi} className="inline-block whitespace-nowrap">
                {word.split("").map((char, ci) => (
                  <span key={ci} className="about-char inline-block opacity-0">
                    {char}
                  </span>
                ))}
                {wi < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        ))}
      </div>
    );
  },
);
