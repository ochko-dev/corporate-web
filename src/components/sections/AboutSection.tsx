"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { AboutIntroduction } from "../about/AboutIntroduction";
import { VisionCards, type VisionCard } from "../about/VisionCards";
import { ParticleLogoCluster } from "../about/ParticleLogoCluster";

gsap.registerPlugin(ScrollTrigger);

// How far the section stays pinned while the cards scrub in.
const PIN_DISTANCE = "+=200%";

// Timeline positions (relative units — only their proportions matter, since
// the timeline is driven by the pin's 0–1 progress, not played in real time).
const CARDS_START = 6;
const CARDS_END = 96;

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

function AboutGlow() {
  return (
    <>
      <div className="pointer-events-none absolute top-[-10%] left-1/2 -z-10 h-140 w-140 -translate-x-1/2 rounded-full bg-[#075D87]/30 blur-[120px]" />
      <div className="pointer-events-none absolute right-[8%] bottom-[-5%] -z-10 h-85 w-85 rounded-full bg-[#2FB7C3]/25 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[6%] -z-10 h-75 w-75 rounded-full bg-[#0E7FB0]/20 blur-[110px]" />
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
      onUpdate: (self) => {
        contentTlRef.current?.progress(self.progress);
      },
    });

    return () => pinTrigger.kill();
  }, [reduceMotion]);

  // Owns the vision-card reveal only. Rebuilt whenever the locale changes,
  // since the translated vision text changes the number of `.vision-card`
  // elements it queries. This trigger only scrubs (no `pin`), so rebuilding
  // it never touches the pin-spacer above. The label/intro/logo appear once
  // on entry (see the `motion.div` wrappers below) and are no longer part
  // of this scroll-scrubbed timeline.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll<HTMLElement>(".vision-card") ?? [];

      gsap.set(cards, { opacity: 0, y: 28, scale: 0.94 });

      const tl = gsap.timeline({ paused: true });
      contentTlRef.current = tl;

      const cardsSpan = CARDS_END - CARDS_START;
      // Each card's own reveal is shorter than the gap to the next one, so
      // they land one at a time instead of blurring into a single fade.
      const cardStagger = cards.length ? cardsSpan / cards.length : 0;
      const cardDuration = Math.min(6, cardStagger * 0.6);

      tl.fromTo(
        cards,
        { opacity: 0, y: 32, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: cardDuration,
          stagger: cardStagger,
        },
        CARDS_START,
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
    // overlaps. `initial={false}` keeps the motion.divs static here so
    // prefers-reduced-motion is still honored.
    return (
      <section
        id="about"
        className="relative isolate overflow-hidden bg-background py-32 text-foreground"
      >
        <AboutGlow />
        <motion.div initial={false}>
          <ParticleLogoCluster />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-40 dark:opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />

        <div className="section-container relative z-10 flex flex-col items-center gap-14 text-center">
          <motion.div initial={false} className="flex flex-col items-center gap-14">
            <p className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {ABOUT_LABEL}
            </p>
            <AboutIntroduction paragraphs={INTRO_PARAGRAPHS} />
          </motion.div>

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
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration:0.9, ease: "easeOut" }}
      >
        <ParticleLogoCluster />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />

      <div className="section-container relative z-10 flex h-full flex-col items-end gap-4 pt-24 sm:gap-10 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4}}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex w-full flex-col items-end gap-4 sm:gap-10"
        >
          <div className="w-full text-center text-xs font-semibold tracking-[0.4em] text-primary uppercase">
            {ABOUT_LABEL}
          </div>
          <AboutIntroduction paragraphs={INTRO_PARAGRAPHS} />
        </motion.div>
        <VisionCards ref={cardsRef} cards={VISION_CARDS} />
      </div>
    </section>
  );
}