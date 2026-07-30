'use client';

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

import { Logo } from "../layout/logo";
import { AnimatedTagline } from "../layout/animated-tagline";
import { ThemeToggle } from "../layout/theme-toggle";
import { LanguageSwitcher } from "../layout/language-switcher";
import { navLinks } from "@/src/lib/data/nav";
import { cn } from "@/src/lib/utils";
import { scrollToHash } from "@/src/lib/scroll-to-hash";

function handleHashClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (scrollToHash(href)) event.preventDefault();
}

export function Navbar() {
  const t = useTranslations("nav");

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="fixed inset-x-0 top-0 z-50"
    >

      {/* FULL WIDTH BORDER WRAPPER */}
      <div
        className={cn(
          "w-full transition-all duration-300",
          scrolled
            ? "glass border-b border-border/70 shadow-glow"
            : "bg-transparent border-transparent"
        )}
      >

        {/* CONTENT CONTAINER */}
        <div
          className={cn(
            "mx-auto flex w-full max-w-7xl items-center justify-between px-4 transition-all duration-300",
            scrolled
              ? "py-3"
              : "mt-4 rounded-2xl border border-transparent py-2.5"
          )}
        >

          {/* LOGO */}
          <a
            href="#top"
            onClick={(e) => handleHashClick(e, "#top")}
            className="flex shrink-0 items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo />

            <AnimatedTagline
              className="inline-flex tracking-[0.2em] text-primary uppercase"
            />
          </a>


          <div className="flex items-center gap-2">

            {/* DESKTOP NAV */}
            <nav
              onMouseLeave={() => setHovered(null)}
              className="hidden items-center gap-1 lg:flex"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  onClick={(e) => handleHashClick(e, link.href)}
                  className="
                    group relative isolate inline-flex items-center
                    rounded-full px-3.5 py-2
                    text-sm font-medium
                    text-muted-foreground
                    outline-none transition-colors
                    hover:text-foreground
                    focus-visible:text-foreground
                    focus-visible:ring-3 focus-visible:ring-ring/50
                  "
                >

                  {hovered === link.href && (
                    <motion.span
                      layoutId="navbar-hover-pill"
                      className="
                        absolute inset-0 -z-10
                        rounded-full 
                      "
                      transition={{
                        type: "spring",
                        bounce: 0.25,
                        duration: 0.4,
                      }}
                    />
                  )}

                  {/* VERTICAL WORD ROLL */}
                  <span className="relative block h-[1.25em] overflow-hidden leading-[1.25]">
                    <span
                      className="
                        block transition-transform duration-300
                        ease-[cubic-bezier(0.21,0.47,0.32,0.98)]
                        group-hover:-translate-y-full
                        group-focus-visible:-translate-y-full
                        motion-reduce:transition-none
                      "
                    >
                      {t(link.key)}
                    </span>

                    <span
                      aria-hidden
                      className="
                        absolute inset-0 block translate-y-full
                        transition-transform duration-300
                        ease-[cubic-bezier(0.21,0.47,0.32,0.98)]
                        group-hover:translate-y-0
                        group-focus-visible:translate-y-0
                        motion-reduce:transition-none
                      "
                    >
                      {t(link.key)}
                    </span>
                  </span>

                </a>
              ))}
            </nav>


            <div className="flex items-center gap-1">
              <LanguageSwitcher className="hidden lg:flex" />
              <ThemeToggle />
            </div>


            {/* MOBILE MENU */}
            <Sheet open={open} onOpenChange={setOpen}>

              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("openMenu")}
                    className="lg:hidden"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>


              <SheetContent
                side="right"
                className="glass w-full sm:max-w-sm"
              >

                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center uppercase">
                      <Logo />

                      <span className="ml-2 text-[16px] font-bold tracking-tight">
                        ODIN{" "}
                        <span className="font-medium">
                          tech
                        </span>
                      </span>

                    </div>
                  </SheetTitle>
                </SheetHeader>


                <nav className="flex flex-col gap-1 px-4">

                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        handleHashClick(e, link.href);
                        setOpen(false);
                      }}
                      className="
                        rounded-xl px-3.5 py-3
                        text-base font-medium
                        text-foreground/90
                        hover:bg-muted/60
                      "
                    >
                      {t(link.key)}
                    </a>
                  ))}

                </nav>


                <div className="px-4 pt-2">
                  <LanguageSwitcher variant="inline" />
                </div>


              </SheetContent>

            </Sheet>

          </div>

        </div>

      </div>

    </motion.header>
  );
}