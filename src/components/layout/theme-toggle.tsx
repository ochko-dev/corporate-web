"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import { cn } from "@/src/lib/utils";

function subscribeNever() {
  return () => {};
}

function getMountedSnapshot() {
  return true;
}

function getMountedServerSnapshot() {
  return false;
}

interface ThemeToggleProps {
  /** Reveal shape for the View Transitions animation. */
  shape?: "circle";
  className?: string;
}

export function ThemeToggle({ shape = "circle", className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  // Leaving `theme` undefined before hydration keeps AnimatedThemeToggler in
  // its own uncontrolled mode, whose initial state (false) matches the
  // server render; once mounted it switches to controlled mode and defers
  // to next-themes, which owns persistence and the documentElement class.
  const mounted = useSyncExternalStore(subscribeNever, getMountedSnapshot, getMountedServerSnapshot);

  return (
    <AnimatedThemeToggler
      variant={shape}
      theme={mounted ? (resolvedTheme === "dark" ? "dark" : "light") : undefined}
      onThemeChange={setTheme}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        // icon: rotates on hover / keyboard focus, no background change
        "[&_svg]:size-4 [&_svg]:transition-transform [&_svg]:duration-500 [&_svg]:ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
        "motion-safe:hover:[&_svg]:-rotate-90 motion-safe:focus-visible:[&_svg]:-rotate-90",
        className,
      )}
    />
  );
}