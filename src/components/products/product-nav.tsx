"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/src/lib/utils";
import type { Product } from "@/src/lib/data/products";

interface ProductNavProps {
  products: Product[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Horizontal, pinned product selector. The highlight pill's position is
 *  measured off the active button's rect (same approach as the Hero's
 *  sphere-target calc) and animated with GSAP rather than laid out with
 *  math, so it stays correct across label lengths and breakpoints. */
export function ProductNav({ products, activeIndex, onSelect }: ProductNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const pill = pillRef.current;
    if (!container || !pill) return;

    const reposition = (animate: boolean) => {
      const active = itemRefs.current[activeIndex];
      if (!active) return;
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const target = {
        x: activeRect.left - containerRect.left,
        width: activeRect.width,
      };
      if (animate) {
        gsap.to(pill, { ...target, duration: 0.55, ease: "power3.out" });
      } else {
        gsap.set(pill, target);
      }
    };

    reposition(true);

    const ro = new ResizeObserver(() => reposition(false));
    ro.observe(container);
    return () => ro.disconnect();
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="relative isolate flex w-full items-stretch justify-between overflow-hidden rounded-full border border-border/70 glass p-1.5 shadow-glow"
    >
      <div
        ref={pillRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-1.5 left-0 z-0 w-0 rounded-full bg-primary/15 ring-1 ring-primary/40"
      />
      {products.map((product, index) => {
        const Icon = product.icon;
        const isActive = index === activeIndex;
        return (
          <button
            key={product.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isActive}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-medium transition-colors duration-300 sm:px-4 sm:text-base",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-all duration-500 sm:size-5",
                isActive ? "scale-110 text-primary" : "scale-100",
              )}
              strokeWidth={1.75}
            />
            <span className="hidden sm:inline">{product.name}</span>
          </button>
        );
      })}
    </div>
  );
}
