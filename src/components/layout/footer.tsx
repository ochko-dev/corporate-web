"use client";

import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { DribbbleIcon, GithubIcon, LinkedinIcon, XIcon } from "../icons/social";


const socialLinks = [
  { icon: GithubIcon, href: "#", label: "Facebook" },
  { icon: LinkedinIcon, href: "#", label: "Instagram" },
  { icon: XIcon, href: "#", label: "X" },
  { icon: DribbbleIcon, href: "#", label: "Dribbble" },
];

const CONTACT = {
  address: "Хан-Уул дүүрэг, 15-р хороо, Режис Плейс, 4 давхар,402Б тоот",
  phone: "+976 7505-9911",
  phoneHref: "+97675059911",
  email: "contact@odintech.mn",
};

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3455.008772487023!2d106.90723917710062!3d47.90067557121841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d96936ef95fd02b%3A0x4ddcd9c18ef16c15!2sRegis%20Place!5e1!3m2!1smn!2smn!4v1785311109838!5m2!1smn!2smn";
export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer
      id="contact"
      className="relative isolate overflow-hidden bg-background text-foreground"
    >
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
      <div className="pointer-events-none absolute top-[-15%] left-[10%] -z-10 h-[380px] w-[380px] rounded-full bg-brand-indigo/20 blur-[130px]" />
      <div className="pointer-events-none absolute right-[8%] bottom-[-15%] -z-10 h-[340px] w-[340px] rounded-full bg-brand-cyan/15 blur-[120px]" />

      <div className="section-container relative z-10 pb-10">
        {/* Closing statement + CTA */}
        <div className="flex flex-col items-center gap-10 text-center py-10">
          <p className="max-w-2xl text-3xl leading-snug font-medium text-balance sm:text-4xl lg:text-5xl">
         
            <span className="font-serif text-gradient font-normal italic">
              {t("closingLines.0")},{t("closingLines.1")}
            </span>
          </p>
        </div>

        {/* Map + contact card */}
        <div className="grid overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[440px]">
            <iframe
              src={MAP_SRC}
              title="ODIN tech office location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale-[20%] dark:brightness-90 dark:contrast-115 dark:invert dark:hue-rotate-180"
            />
            {/* Soft edge blending map into the card on desktop */}
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-r from-transparent to-card/40 lg:block" />
          </div>

          <div className="flex flex-col justify-center gap-10 p-8 sm:p-10 lg:p-14">
            <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("findUsPrefix")}{" "}
              <span className="font-serif text-gradient font-normal italic">
                {t("findUsAccent")}
              </span>
            </h3>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground/70 uppercase">
                  {t("addressLabel")}
                </p>
                <p className="mt-3 flex max-w-sm items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  {t("address")}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground/70 uppercase">
                  {t("getInTouchLabel")}
                </p>
                <div className="mt-3 flex flex-col gap-2.5 text-sm text-muted-foreground">
                  <a
                    href={`tel:${CONTACT.phoneHref}`}
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <Phone className="size-4 text-primary" />
                    {CONTACT.phone}
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <Mail className="size-4 text-primary" />
                    {CONTACT.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="section-container relative z-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-border/60 py-6 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>

        {/* <div className="flex items-center gap-2">
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div> */}
      </div>
    </footer>
  );
}