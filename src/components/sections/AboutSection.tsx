"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";
import { AboutIntroduction } from "../about/AboutIntroduction";
import { VisionCards, type VisionCard } from "../about/VisionCards";
import Logo from "../icons/Logo";
import { ABOUT_PHASES, PIN_DISTANCE } from "@/lib/about-phases";

gsap.registerPlugin(ScrollTrigger);

const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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

function AboutWatermark() {
  return (
    <div className="pointer-events-none absolute  right-4 z-0 origin-top-right scale-[7] opacity-[0.08] sm:top-8 sm:right-10 sm:scale-[9]">
      <Logo />
    </div>
  );
}

function AboutGlow() {
  return (
    <>
      <div className="pointer-events-none absolute top-[-10%] left-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#075D87]/30 blur-[120px]" />
      <div className="pointer-events-none absolute right-[8%] bottom-[-5%] -z-10 h-[340px] w-[340px] rounded-full bg-[#2FB7C3]/25 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[6%] -z-10 h-[300px] w-[300px] rounded-full bg-[#0E7FB0]/20 blur-[110px]" />
    </>
  );
}

export function AboutSection() {
  const t = useTranslations("about");
  const locale = useLocale();
  const ABOUT_LABEL = t("label");
  const INTRO_PARAGRAPHS = [t("intro")] as const;
  const VISION_CARDS = t.raw("vision") as VisionCard[];

  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const contentTlRef = useRef<gsap.core.Timeline | null>(null);

  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotionSnapshot,
    getReduceMotionServerSnapshot,
  );

  // Owns the pin only. Kept independent of `locale` so switching languages
  // never tears down or re-inserts the pin-spacer — doing that while pinned
  // mid-scroll desyncs ScrollTrigger's cached start/end for whatever section
  // comes next (its geometry depends on this spacer's height), producing a
  // visible jump into that section and back.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return;

    const pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: PIN_DISTANCE,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => contentTlRef.current?.progress(self.progress),
    });

    return () => pinTrigger.kill();
  }, [reduceMotion]);

  // Owns the label/typing/vision-card reveal. Rebuilt whenever the locale
  // changes, since the translated intro/vision text changes the number of
  // `.about-char`/`.vision-card` elements it queries. This trigger only
  // scrubs (no `pin`), so rebuilding it never touches the pin-spacer above.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return;

    const ctx = gsap.context(() => {
      const chars = introRef.current?.querySelectorAll<HTMLElement>(".about-char") ?? [];
      const cards = cardsRef.current?.querySelectorAll<HTMLElement>(".vision-card") ?? [];

      gsap.set(labelRef.current, { opacity: 0, y: 10 });
      gsap.set(cards, { opacity: 0, y: 28, scale: 0.94 });

      const tl = gsap.timeline({ paused: true });
      contentTlRef.current = tl;

      const typingSpan = ABOUT_PHASES.typingEnd - ABOUT_PHASES.typingStart;
      const charDuration = Math.min(0.4, typingSpan * 0.6);
      const cardsSpan = ABOUT_PHASES.cardsEnd - ABOUT_PHASES.cardsStart;
      // Each card's own reveal is shorter than the gap to the next one, so
      // they land one at a time instead of blurring into a single fade.
      const cardStagger = cards.length ? cardsSpan / cards.length : 0;
      const cardDuration = Math.min(6, cardStagger * 0.6);

      tl.fromTo(
        labelRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 4 },
        ABOUT_PHASES.labelIn,
      )
        .fromTo(
          chars,
          { opacity: 0 },
          {
            opacity: 1,
            duration: charDuration,
            stagger: chars.length ? (typingSpan - charDuration) / chars.length : 0,
          },
          ABOUT_PHASES.typingStart,
        )
        .fromTo(
          cards,
          { opacity: 0, y: 32, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: cardDuration,
            stagger: cardStagger,
          },
          ABOUT_PHASES.cardsStart,
        );

      // Sync to wherever the (untouched) pin currently is, so a locale
      // switch mid-scroll doesn't reset the reveal back to its start.
      const existingTrigger = ScrollTrigger.getAll().find((st) => st.trigger === section && st.pin);
      if (existingTrigger) tl.progress(existingTrigger.progress);
    }, section);

    return () => ctx.revert();
  }, [reduceMotion, locale]);

  if (reduceMotion) {
    // No pin, no scrub: a plain top-to-bottom reading order so nothing
    // overlaps.
    return (
      <section
        id="about"
        className="relative isolate overflow-hidden bg-background py-32 text-foreground"
      >
        <AboutGlow />
        <AboutWatermark />
        <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-40 dark:opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />

        <div className="section-container relative z-10 flex flex-col items-center gap-14 text-center">
          <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
            {ABOUT_LABEL}
          </p>

          <div className="[&_.about-char]:opacity-100">
            <AboutIntroduction paragraphs={INTRO_PARAGRAPHS} />
          </div>

          <div className="[&_.vision-card]:opacity-100">
            <VisionCards cards={VISION_CARDS} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative isolate h-svh overflow-hidden bg-background text-foreground"
    >
      <AboutGlow />
      <AboutWatermark />
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />

      {/* Label sits in normal flow above the intro so it can never collide
          with the paragraph text; the vision items stack below the intro
          and reveal one at a time as the pin scrubs, so nothing the user
          has already read gets taken away. */}
      <div className="section-container relative z-10 flex h-full flex-col items-start gap-10 pt-28 sm:gap-10 sm:pt-32">
        <div
          ref={labelRef}
          className="text-xs font-semibold tracking-[0.4em] text-primary uppercase opacity-0"
        >
          {ABOUT_LABEL}
        </div>
        <AboutIntroduction ref={introRef} paragraphs={INTRO_PARAGRAPHS} />
        <VisionCards ref={cardsRef} cards={VISION_CARDS} />
      </div>
    </section>
  );
}
