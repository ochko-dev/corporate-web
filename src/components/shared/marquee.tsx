import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  duration?: string;
}

export function Marquee({
  children,
  className,
  reverse = false,
  duration = "40s",
}: MarqueeProps) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center gap-4",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          "group-hover:[animation-play-state:paused]",
        )}
        style={{ animationDuration: duration }}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-4",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          "group-hover:[animation-play-state:paused]",
        )}
        style={{ animationDuration: duration }}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}
