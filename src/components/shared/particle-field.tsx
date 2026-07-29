"use client";

import { forwardRef, useImperativeHandle } from "react";
import { cn } from "@/src/lib/utils";
import {
  useParticleField,
  type ParticleFieldControls,
  type UseParticleFieldOptions,
} from "@/src/lib/particles/useParticleField";

export type { ParticleFieldControls };

export type ParticleFieldProps = UseParticleFieldOptions & { className: string };

/**
 * Generic scroll-drivable particle canvas: owns one `ParticleEngine`
 * instance and exposes an imperative `setProgress()` so a parent's GSAP
 * `ScrollTrigger.onUpdate` can push scroll progress in every tick without
 * causing React re-renders. What the particles actually form is entirely up
 * to the `computeBlend`/shapes passed in — this component has no opinion on
 * sphere vs logo vs any future shape.
 *
 * `className` is required (not merged with a positioning default): Tailwind
 * can't reliably override a baked-in `inset-0` with a caller's `right-*`/
 * `top-*` through class-string concatenation alone (they're different
 * utility groups fighting over the same CSS properties, and plain string
 * order doesn't decide cascade order) — so every consumer supplies its own
 * full position/size (e.g. `absolute inset-0 -z-10` or
 * `absolute right-10 top-8 z-0 h-90 w-90`) instead of layering onto a
 * default that only happens to fit one of them.
 */
export const ParticleField = forwardRef<ParticleFieldControls, ParticleFieldProps>(
  function ParticleField({ className, ...fieldOptions }, ref) {
    const { containerRef, canvasRef, setProgress } = useParticleField(fieldOptions);

    useImperativeHandle(ref, () => ({ setProgress }), [setProgress]);

    const overscan = fieldOptions.overscan ?? 1;

    return (
      <div
        ref={containerRef}
        aria-hidden
        className={cn("pointer-events-none overflow-visible", className)}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: `${overscan * 100}%`, height: `${overscan * 100}%` }}
        />
      </div>
    );
  },
);
