"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { DataSphere } from "../shared/data-sphere";
import { scrollToHash } from "@/src/lib/scroll-to-hash";

const SPHERE_MIN_SCALE = 0.55;
const SPHERE_MAX_SCALE = 1;


const ASSEMBLE_DURATION = 7.4;
const SETTLE_DELAY = ASSEMBLE_DURATION - 0.3;

export function Hero() {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);
  const sphereWrapRef = useRef<HTMLDivElement>(null);
  const sphereSlotRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const sphereWrap = sphereWrapRef.current;
    const sphereSlot = sphereSlotRef.current;
    if (!section || !sphereWrap || !sphereSlot) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const textBlocks = [headlineRef.current];

    function getSphereTarget() {
      const sectionRect = section!.getBoundingClientRect();
      const slotRect = sphereSlot!.getBoundingClientRect();
      const naturalWidth = sphereWrap!.offsetWidth || 1;

      const fromCx = sectionRect.left + sectionRect.width / 2;
      const fromCy = sectionRect.top + sectionRect.height / 2;
      const toCx = slotRect.left + slotRect.width / 2;
      const toCy = slotRect.top + slotRect.height / 2;

      const scale = gsap.utils.clamp(
        SPHERE_MIN_SCALE,
        SPHERE_MAX_SCALE,
        (slotRect.width * 0.92) / naturalWidth
      );

      return { x: toCx - fromCx, y: toCy - fromCy, scale };
    }

    const ctx = gsap.context(() => {
      gsap.set(sphereWrap, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1 });

      if (reduceMotion) {
        gsap.set(sphereWrap, getSphereTarget());
        gsap.set(textBlocks, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
        return;
      }

      gsap.set(textBlocks, { opacity: 0, y: 32, scale: 0.96, filter: "blur(14px)" });

    const tl = gsap.timeline({ delay: SETTLE_DELAY });

      tl.to(
        sphereWrap,
        {
          x: () => getSphereTarget().x,
          y: () => getSphereTarget().y,
          scale: () => getSphereTarget().scale,
          duration: 1.7,
          ease: "power2.inOut",
        },
        0
      ).to(
        headlineRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
        },
        1.0
      );

      const onResize = () => {
        if (tl.progress() === 1) gsap.set(sphereWrap, getSphereTarget());
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative h-svh overflow-hidden"
    >
      <div className="absolute inset-0 -z-20 bg-grid mask-fade-b opacity-0 dark:opacity-20" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#075D87]/35 blur-[120px] animate-glow-pulse" />
      <div className="pointer-events-none absolute top-40 right-[8%] -z-10 h-[320px] w-[320px] rounded-full bg-[#2FB7C3]/30 blur-[110px] animate-glow-pulse [animation-delay:1.5s]" />
      <div className="pointer-events-none absolute bottom-0 left-[10%] -z-10 h-[300px] w-[300px] rounded-full bg-[#0E7FB0]/25 blur-[110px] animate-glow-pulse [animation-delay:0.8s]" />
      <div className="absolute inset-0 -z-10 bg-noise opacity-[0.03] mix-blend-overlay" />

     <div className="section-container relative z-10 flex h-full flex-col gap-10 pt-28 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-10 lg:pt-0">
        <div className="flex flex-col items-start text-left">
          <h1
            ref={headlineRef}
            className="max-w-xl text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {t("headlinePrefix")}
            <br />
            <span className="font-serif text-gradient font-normal italic">
              {t("headlineAccent")}
            </span>
          </h1>
        </div>

        <div
          ref={sphereSlotRef}
          className="aspect-square w-full max-w-104 self-center lg:h-full lg:w-full lg:max-w-none lg:self-auto"
          aria-hidden
        />
      </div>

      <div
        ref={sphereWrapRef}
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 aspect-square w-[min(92vw,640px)] sm:w-[min(64vw,560px)] lg:w-155"
      >
        <DataSphere />
      </div>

      <a
        href="#about"
        onClick={(e) => {
          if (scrollToHash("#about")) e.preventDefault();
        }}
        aria-label={t("scrollCue")}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground"
        >
          <ChevronDown className="size-4" />
        </motion.div>
      </a>
    </section>
  );
}