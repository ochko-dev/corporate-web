"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { team } from "@/src/lib/data/team";

/** Billing tiers: how many names share each type size, largest first. */
const TIERS = [
  { take: 1, name: "text-4xl sm:text-6xl lg:text-7xl", role: "text-[11px]" },
  { take: 2, name: "text-3xl sm:text-5xl lg:text-6xl", role: "text-[10px]" },
  { take: Infinity, name: "text-xl sm:text-3xl lg:text-4xl", role: "text-[10px]" },
];

/** Each word animates on its own when it enters the viewport. */
const WORD_IN = {
  initial: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.6 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
} as const;

export function TeamSection() {
  const t = useTranslations("team");

  let cursor = 0;
  const rows = TIERS.map((tier) => {
    const slice = team.slice(cursor, cursor + (tier.take === Infinity ? team.length : tier.take));
    // eslint-disable-next-line react-hooks/immutability
    cursor += slice.length;
    return { ...tier, members: slice };
  }).filter((row) => row.members.length > 0);

  return (
    <section
      id="team"
      className="relative isolate overflow-hidden bg-background py-28 text-foreground lg:py-36"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-[0.05]" />

      <div className="section-container relative">
 <div className="flex items-center justify-center gap-4 sm:gap-6">
  <span className="h-px w-14 bg-linear-to-r from-transparent to-border sm:w-24" aria-hidden />
  <span className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
    {t("eyebrow")}
  </span>
  <span className="h-px w-14 bg-linear-to-l from-transparent to-border sm:w-24" aria-hidden />
</div>

        <div className="mx-auto mt-16 max-w-5xl">
          {rows.map((row, ri) => (
            <div key={ri}>
              <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-8 lg:gap-x-12">
                {row.members.map((member) => (
                  <motion.div
                    key={member.id}
                    className="group max-w-full text-center"
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  >
                    <p
                      className={`${row.name} leading-[0.95] font-semibold tracking-tight text-balance uppercase`}
                    >
                      <motion.span
                        {...WORD_IN}
                        className="inline-block transition-colors duration-300 ease-out group-hover:text-primary"
                      >
                        {t(`names.${member.id}.firstName`)}
                      </motion.span>

                    {t.has(`names.${member.id}.lastName`) ? (
  <motion.span
    {...WORD_IN}
    className="mt-1 block text-[0.6em] leading-[1] font-normal tracking-[0.02em] text-muted-foreground transition-colors duration-300 ease-out group-hover:text-primary/60"
  >
    {t(`names.${member.id}.lastName`)}
  </motion.span>
) : null}
                    </p>

                    <motion.p
                      {...WORD_IN}
                      transition={{ ...WORD_IN.transition, delay: 0.12 }}
                      className={`${row.role} mt-4 font-mono leading-relaxed tracking-[0.18em] text-muted-foreground/60 uppercase transition-colors duration-300 ease-out group-hover:text-primary`}
                    >
                      {t(`positions.${member.positionKey}`)}
                    </motion.p>
                  </motion.div>
                ))}
              </div>

              {ri < rows.length - 1 ? (
                <span className="mx-auto my-12 block h-px w-16 bg-border/60 lg:my-16" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}