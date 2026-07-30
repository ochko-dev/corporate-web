"use client";

import { useTranslations } from "next-intl";
import { StaggerGroup, StaggerItem } from "../shared/reveal";
import { team } from "@/src/lib/data/team";
import { TeamCard } from "../team/TeamCard";

export function TeamSection() {
  const t = useTranslations("team");

  return (
    <section id="team" className="relative isolate overflow-hidden bg-background py-28 text-foreground lg:py-36">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-[0.05]" />
      <div className="pointer-events-none absolute top-[-10%] left-[8%] -z-10 h-[380px] w-[380px] rounded-full bg-brand-indigo/15 blur-[130px]" />
      <div className="pointer-events-none absolute right-[6%] bottom-[-10%] -z-10 h-[340px] w-[340px] rounded-full bg-brand-cyan/10 blur-[120px]" />

      <div className="section-container relative">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
            {t("eyebrow")}
          </span>

        </div>

        <StaggerGroup className="mt-16 flex flex-wrap justify-center gap-8 lg:gap-10">
          {team.map((member) => (
            <StaggerItem
              key={member.id}
              className="h-full w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.667rem)] xl:w-[calc(25%-1.875rem)]"
            >
              <TeamCard
                member={member}
                firstName={t(`names.${member.id}.firstName`)}
                lastName={t.has(`names.${member.id}.lastName`) ? t(`names.${member.id}.lastName`) : undefined}
                position={t(`positions.${member.positionKey}`)}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
