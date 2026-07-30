"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AboutIntroduction } from "../about/AboutIntroduction";
import { ParticleLogoCluster } from "../about/ParticleLogoCluster";
import VisionCards from "../about/VisionCards";


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
  const ABOUT_LABEL = t("label");
  const INTRO_PARAGRAPHS = [t("intro")] as const;
  const VISION_CARDS = t.raw("vision") as { title: string; description: string }[];

  return (
    <section
  id="about"
  className="relative isolate min-h-svh overflow-hidden bg-background text-foreground"
>
      <AboutGlow />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration:0.9, ease: "easeOut" }}
        className=""
      >
        <ParticleLogoCluster />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />

      <div className="section-container relative z-10 flex min-h-full flex-col items-end gap-4 py-24 sm:gap-10 sm:py-32">
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
       <div className="w-full pb-8 sm:pb-0">
  <VisionCards cards={VISION_CARDS} />
</div>
      </div>
    </section>
  );
}