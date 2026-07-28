"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CHAR_STEP_MS = 45;
const HOLD_MS = 2600;

/**
 * Reveals text one character at a time (left to right), holds the completed
 * sentence briefly, then resets to empty and loops — forever. Pure React
 * state + CSS transitions; no animation library. All characters are always
 * present in the DOM (only opacity/transform toggle) so the reveal never
 * shifts layout, and the reset is transition-free so it reads as an instant
 * cut rather than a reverse fade.
 */
export function AnimatedTagline({ className }: { className?: string }) {

  const text = "open data intelligence network"; // t("tagline") --- IGNORE ---
  const [revealed, setRevealed] = useState(0);
  const [instant, setInstant] = useState(true);

  useEffect(() => {
    let revealTimer: ReturnType<typeof setInterval> | undefined;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let raf1 = 0;
    let raf2 = 0;
    let cancelled = false;

    function startReveal() {
      let count = 0;
      revealTimer = setInterval(() => {
        count += 1;
        setRevealed(count);
        if (count >= text.length) {
          clearInterval(revealTimer);
          holdTimer = setTimeout(reset, HOLD_MS);
        }
      }, CHAR_STEP_MS);
    }

    function reset() {
      if (cancelled) return;
      // Jump back to empty with transitions disabled, so it reads as an
      // instant cut. Two rAFs guarantee that state is painted before we
      // re-enable transitions for the next reveal pass.
      setInstant(true);
      setRevealed(0);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (cancelled) return;
          setInstant(false);
          startReveal();
        });
      });
    }

    startReveal();

    return () => {
      cancelled = true;
      clearInterval(revealTimer);
      clearTimeout(holdTimer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [text]);

  return (
    <span className={cn("flex flex-col leading-tight", className)}>
      {/* Wordmark above */}
      <span className="text-[16px] font-bold tracking-tight text-foreground">
        ODIN <span className="font-medium">tech</span>
      </span>

      {/* Animated tagline below */}
      <span className="relative text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        <span className="sr-only">{text}</span>
        <span aria-hidden className="whitespace-pre">
          {text.split("").map((char, i) => (
            <span
              key={i}
              className={cn(
                "inline-block transition-[opacity,transform] ease-out",
                instant ? "duration-[0ms]" : "duration-300",
                i < revealed ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              )}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}