"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleSwitcher } from "../providers/locale-provider";
import type { Locale } from "@/lib/i18n/config";

interface LanguageSwitcherProps {
  /** `dropdown` for the desktop navbar, `inline` for the mobile sheet. */
  variant?: "dropdown" | "inline";
  className?: string;
}

export function LanguageSwitcher({ variant = "dropdown", className }: LanguageSwitcherProps) {
  const { locale, setLocale, locales, localeNames, localeFlags } = useLocaleSwitcher();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSelect(next: Locale) {
    setLocale(next);
    setOpen(false);
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

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          open && "bg-muted/60 text-foreground",
        )}
      >
        <Globe className="size-4" />
        <span className="uppercase">{locale}</span>
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.21, 0.47, 0.32, 0.98] }}
            role="listbox"
            aria-label="Language"
            className="glass shadow-glow absolute right-0 z-50 mt-2 min-w-44 origin-top-right overflow-hidden rounded-2xl border border-border/70 p-1.5"
          >
            {locales.map((code) => (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={locale === code}
                onClick={() => handleSelect(code)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  locale === code
                    ? "bg-primary/15 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span aria-hidden>{localeFlags[code]}</span>
                <span className="flex-1 text-left">{localeNames[code]}</span>
                {locale === code && <Check className="size-3.5 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
