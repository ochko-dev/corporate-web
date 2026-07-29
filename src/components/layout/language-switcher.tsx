"use client";

import { Globe } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLocaleSwitcher } from "../providers/locale-provider";
import type { Locale } from "@/src/lib/i18n/config";

interface LanguageSwitcherProps {
  /** `toggle` for the desktop navbar, `inline` for the mobile sheet. */
  variant?: "toggle" | "inline";
  className?: string;
}

export function LanguageSwitcher({ variant = "toggle", className }: LanguageSwitcherProps) {
  const { locale, setLocale, locales, localeNames, localeFlags } = useLocaleSwitcher();

  function handleSelect(next: Locale) {
    setLocale(next);
  }

  if (variant === "inline") {
    return (
      <div
        role="radiogroup"
        aria-label="Language"
        className={cn(
          "flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 p-1",
          className,
        )}
      >
        {locales.map((code) => (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={locale === code}
            onClick={() => handleSelect(code)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              locale === code
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span aria-hidden>{localeFlags[code]}</span>
            {localeNames[code]}
          </button>
        ))}
      </div>
    );
  }

  // Exactly two locales are configured (see src/lib/i18n/config.ts), so a
  // single click always has one unambiguous target: whichever isn't current.
  const otherLocale = locales.find((code) => code !== locale) ?? locale;

  return (
    <button
      type="button"
      onClick={() => handleSelect(otherLocale)}
      aria-label={`Switch to ${localeNames[otherLocale]}`}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <Globe className="size-4" />
      <span className="uppercase">{locale}</span>
    </button>
  );
}
