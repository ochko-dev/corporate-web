"use client";

import { forwardRef } from "react";
import { Cpu, Database, Network, Sparkles, type LucideIcon } from "lucide-react";

export type VisionCard = {
  title: string;
  description: string;
};

const VISION_ICONS: readonly LucideIcon[] = [Database, Cpu, Network, Sparkles];

/** AboutSection queries `.vision-card` inside the returned ref to stagger
 *  each card's reveal against the master scroll timeline. */
export const VisionCards = forwardRef<HTMLDivElement, { cards: readonly VisionCard[] }>(
  function VisionCards({ cards }, ref) {
    return (
      <div
        ref={ref}
        className="mx-auto grid w-full  grid-cols-2 gap-x-4 gap-y-4 pt-6 text-left sm:grid-cols-4 sm:gap-x-0 sm:gap-y-0 sm:pt-20 sm:divide-x sm:divide-border"
      >
        {cards.map((card, index) => {
          const Icon = VISION_ICONS[index % VISION_ICONS.length];
          return (
            <div key={card.title} className="vision-card flex flex-col gap-2 opacity-0 sm:px-6 sm:first:pl-0">
              <Icon className="h-6 w-6 text-primary/70 sm:h-7 sm:w-7" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-foreground sm:text-base">{card.title}</h3>
              <p className="text-xs leading-relaxed text-foreground/60 sm:text-sm">{card.description}</p>
            </div>
          );
        })}
      </div>
    );
  },
);
