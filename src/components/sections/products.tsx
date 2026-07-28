"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { ProductNav } from "../products/product-nav";
import { ProductContent } from "../products/product-content";
import { ProductVisual } from "../products/product-visual";
import { Reveal } from "../shared/reveal";
import { PRODUCTS_META, PRODUCTS_PIN_DISTANCE, type Product } from "@/lib/data/products";

gsap.registerPlugin(ScrollTrigger);

const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SEGMENTS = PRODUCTS_META.length - 1;

function subscribeReduceMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCE_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReduceMotionSnapshot() {
  return window.matchMedia(REDUCE_MOTION_QUERY).matches;
}

function getReduceMotionServerSnapshot() {
  return false;
}

function ProductsGlow() {
  return (
    <>
      <div className="pointer-events-none absolute -top-32 right-[10%] -z-10 h-[420px] w-[420px] rounded-full bg-[#2FB7C3]/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[6%] -z-10 h-[380px] w-[380px] rounded-full bg-[#075D87]/25 blur-[120px]" />
    </>
  );
}

export function Products() {
  const t = useTranslations("products");
  const PRODUCTS: Product[] = PRODUCTS_META.map((meta) => ({
    ...meta,
    name: t(`items.${meta.id}.name`),
    title: t(`items.${meta.id}.title`),
    description: t(`items.${meta.id}.description`),
  }));

  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const crossfadeRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);

  const lastIndexRef = useRef(0);
  const skipFadeOutRef = useRef(true);
  const skipFadeInRef = useRef(true);

  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotionSnapshot,
    getReduceMotionServerSnapshot,
  );

  // Drives the pinned scroll: figures out which product segment the
  // scroll position is in, updates the nav immediately, and applies a
  // small continuous parallax to the visual while inside a segment.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion || SEGMENTS <= 0) return;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: PRODUCTS_PIN_DISTANCE,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: (value: number) => Math.round(value * SEGMENTS) / SEGMENTS,
          duration: 0.45,
          ease: "power1.inOut",
        },
        onUpdate: (self) => {
          const raw = self.progress * SEGMENTS;
          const index = Math.min(SEGMENTS, Math.max(0, Math.round(raw)));
          const fraction = gsap.utils.clamp(-0.5, 0.5, raw - index);

          gsap.set(parallaxRef.current, { y: fraction * 28 });

          if (index !== lastIndexRef.current) {
            lastIndexRef.current = index;
            setActiveIndex(index);
          }
        },
      });

      return () => trigger.kill();
    }, section);

    return () => ctx.revert();
  }, [reduceMotion]);

  // Fade the current content out, then hand off to the fade-in effect once
  // the new product is committed to `displayedIndex`.
  useLayoutEffect(() => {
    if (skipFadeOutRef.current) {
      skipFadeOutRef.current = false;
      return;
    }
    const container = contentRef.current;
    const visual = crossfadeRef.current;
    if (!container || !visual) return;

    const targets = [
      container.querySelector(".product-title"),
      container.querySelector(".product-description"),
      visual,
    ];

    const tl = gsap.timeline({
      onComplete: () => setDisplayedIndex(activeIndex),
    });
    tl.to(targets, {
      opacity: 0,
      y: -12,
      duration: 0.3,
      ease: "power2.in",
    });

    return () => {
      tl.kill();
    };
  }, [activeIndex]);

  // Reveal the newly-committed product: heading and description slide up
  // while the visual crossfades with a subtle scale.
  useLayoutEffect(() => {
    if (skipFadeInRef.current) {
      skipFadeInRef.current = false;
      return;
    }
    const container = contentRef.current;
    const visual = crossfadeRef.current;
    if (!container || !visual) return;

    const title = container.querySelector(".product-title");
    const description = container.querySelector(".product-description");

    gsap.set([title, description], { opacity: 0, y: 24 });
    gsap.set(visual, { opacity: 0, scale: 0.96 });

    const tl = gsap.timeline();
    tl.to(visual, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, 0)
      .to(title, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.05)
      .to(description, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.15);

    return () => {
      tl.kill();
    };
  }, [displayedIndex]);

  function handleSelect(index: number) {
    if (reduceMotion) {
      lastIndexRef.current = index;
      setActiveIndex(index);
      return;
    }
    const trigger = ScrollTrigger.getAll().find((st) => st.trigger === sectionRef.current);
    if (!trigger) return;
    const targetProgress = SEGMENTS === 0 ? 0 : index / SEGMENTS;
    const scrollPos = trigger.start + (trigger.end - trigger.start) * targetProgress;
    window.scrollTo({ top: scrollPos, behavior: "smooth" });
  }

  if (reduceMotion) {
    return (
      <section
        id="products"
        className="relative isolate overflow-hidden bg-background py-28 text-foreground lg:py-36"
      >
        <ProductsGlow />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-[0.08]" />

        <div className="section-container relative z-10 flex flex-col gap-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="max-w-2xl text-3xl leading-tight font-bold tracking-tight uppercase sm:text-4xl">
              {t("headline")}
              <br />
              <span className="text-gradient">{t("headlineAccent")}</span>
            </h2>
          </div>

          {PRODUCTS.map((product) => (
            <Reveal key={product.id}>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <ProductContent product={product} />
                <ProductVisual product={product} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  const displayedProduct = PRODUCTS[displayedIndex];

  return (
    <section
      ref={sectionRef}
      id="products"
      className="relative isolate h-svh overflow-hidden bg-background text-foreground"
    >
      <ProductsGlow />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-noise opacity-[0.03] mix-blend-overlay" />

      <div className="section-container relative z-10 flex h-full flex-col justify-center gap-8 pt-24 sm:gap-10 sm:pt-28">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
            {t("eyebrow")}
          </span>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("headline")}
            <br />
            <span className="font-serif text-gradient font-normal italic">
            {t("headlineAccent")}
            </span>
          </h2>
        </div>

        <ProductNav products={PRODUCTS} activeIndex={activeIndex} onSelect={handleSelect} />

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductContent ref={contentRef} product={displayedProduct} />
          <div ref={parallaxRef} className="relative mx-auto w-full max-w-md lg:max-w-full">
            <div ref={crossfadeRef}>
              <ProductVisual product={displayedProduct} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
