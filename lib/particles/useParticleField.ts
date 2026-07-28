"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { ParticleEngine, type EngineOptions } from "./engine";
import type { SceneBlend } from "./types";
import { clamp01 } from "./random";

export type UseParticleFieldOptions = {
  count: number;
  engineOptions?: EngineOptions;
  /** Given the latest external progress (0-1, pushed in via `setProgress`)
   *  and elapsed seconds since mount, returns what to render this frame.
   *  Read fresh every frame via a ref, so it can close over live shapes
   *  without ever tearing down/recreating the canvas or particle pool. */
  computeBlend: (progress: number, elapsed: number) => SceneBlend;
  /** 0 = crisp, fully cleared every frame. Toward 1 = previous frames linger
   *  and fade, for a soft motion-blur streak behind fast-moving particles. */
  trail?: number;
  /** Canvas drawn this many times larger than the host box, so motion (e.g.
   *  an explosion) can spill beyond the box's own clipped bounds. */
  overscan?: number;
  /** Radial vignette mask, in percent-of-canvas. Null disables the mask. */
  mask?: { inner: number; outer: number } | null;
};

export type ParticleFieldControls = {
  setProgress: (p: number) => void;
};

export function useParticleField(options: UseParticleFieldOptions): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
} & ParticleFieldControls {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const setProgress = useCallback((p: number) => {
    progressRef.current = clamp01(p);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = new ParticleEngine(options.count, options.engineOptions);

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const overscan = options.overscan ?? 1;

    function resize() {
      const rect = container!.getBoundingClientRect();
      width = rect.width * overscan;
      height = rect.height * overscan;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    if (options.mask) {
      const { inner, outer } = options.mask;
      const maskImage = `radial-gradient(circle at center, black 0%, black ${inner}%, transparent ${outer}%)`;
      canvas.style.maskImage = maskImage;
      canvas.style.webkitMaskImage = maskImage;
    }

    let raf = 0;
    const mountTime = performance.now();

    function frame(now: number) {
      const elapsed = (now - mountTime) / 1000;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const trail = clamp01(optionsRef.current.trail ?? 0);
      if (trail < 0.001) {
        ctx!.clearRect(0, 0, width, height);
      } else {
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.fillStyle = `rgba(0,0,0,${1 - trail})`;
        ctx!.fillRect(0, 0, width, height);
        ctx!.globalCompositeOperation = "source-over";
      }

      const blend = optionsRef.current.computeBlend(progressRef.current, elapsed);
      engine.render(ctx!, width, height, blend, { reduceMotion, overscan });

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
    // Live values (computeBlend/trail/mask/etc.) are read from optionsRef
    // every frame; only `count` should tear down and re-init the pool.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.count]);

  return { containerRef, canvasRef, setProgress };
}
