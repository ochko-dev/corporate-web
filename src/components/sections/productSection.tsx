"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductVisual } from "../products/product-visual";
import { Reveal } from "../shared/reveal";
import { PRODUCTS_META, type Product } from "@/src/lib/data/products";

/**
 * Products — "expanding panels" загвар.
 *
 * Desktop: 3 босоо панель зэрэгцэн байрлана. Идэвхтэй панель нь
 * flex-grow анимацаар өргөсч, дотроо visual + контентоо харуулна.
 * Идэвхгүй панелиуд нарийсч, зөвхөн босоо бичигтэй нэрээ үлдээнэ.
 * Mobile: босоо accordion — дарж нээнэ.
 * ScrollTrigger, GSAP огт хэрэглээгүй — цэвэр CSS transition.
 */

function ProductsGlow() {
  return (
    <>
      <div className="pointer-events-none absolute -top-32 right-[10%] -z-10 h-[420px] w-[420px] rounded-full bg-[#2FB7C3]/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[6%] -z-10 h-[380px] w-[380px] rounded-full bg-[#075D87]/25 blur-[120px]" />
    </>
  );
}

export function ProductSection() {
  const t = useTranslations("products");
  const PRODUCTS: Product[] = PRODUCTS_META.map((meta) => ({
    ...meta,
    name: t(`items.${meta.id}.name`),
    title: t(`items.${meta.id}.title`),
    description: t(`items.${meta.id}.description`),
  }));

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="products"
      className="relative isolate overflow-hidden bg-background py-24 text-foreground lg:py-32"
    >
      <ProductsGlow />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-noise opacity-[0.03] mix-blend-overlay" />

      <div className="section-container relative z-10 flex flex-col gap-14 lg:gap-16">
        {/* Header */}
        <Reveal>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("headline")}
              <br />
              <span className="font-serif text-gradient font-normal italic">
                {t("headlineAccent")}
              </span>
            </h2>
          </div>
        </Reveal>

        {/* ==================== Desktop: expanding rows ==================== */}
        <Reveal>
          <div className="hidden h-[560px] flex-col gap-4 lg:flex xl:h-[620px]">
            {PRODUCTS.map((product, index) => {
              const active = activeIndex === index;
              const href = (product as { href?: string }).href;

              return (
                <div
                  key={product.id}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`group relative  overflow-hidden rounded-2xl border transition-[flex-grow,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    active
                      ? "grow-[4] border-primary/40 shadow-[0_30px_80px_-30px_rgba(47,183,195,0.3)]"
                      : "grow border-border/60 hover:border-border"
                  }`}
                >
                  {/* Дэвсгэр visual — баруун талд байрлана */}
<div
  className={`absolute right-0 top-0 h-full w-[58%] transition-all duration-700 ${
    active
      ? "scale-100 opacity-100"
      : "scale-110 opacity-20 blur-[2px] grayscale"
  }`}
>
  <div
    className="h-full w-full"
style={{
  maskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,.4) 15%, black 45%)",
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,.4) 15%, black 45%)",
}}
  >
    <ProductVisual product={product} />
  </div>
</div>

                  {/* Уншигдахуйц болгох давхарга */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
                  {/* Идэвхгүй үеийн нэг мөр гарчиг */}
                  <div
                    className={`absolute inset-0 flex items-center gap-6 px-8 transition-opacity duration-500 xl:px-10 ${
                      active ? "pointer-events-none opacity-0" : "opacity-100"
                    }`}
                  >
                    <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xl font-semibold tracking-tight text-foreground/70 xl:text-2xl">
                      {product.name}
                    </span>
                    <span className="h-px flex-1 bg-border/40" />
                    <span className="size-2 rounded-full bg-primary/50" />
                  </div>

                  {/* Идэвхтэй үеийн контент — зүүн талд */}
                  <div
                    className={`absolute inset-y-0 left-0 flex w-full max-w-xl flex-col justify-center gap-3 p-8 transition-all delay-150 duration-500 xl:p-10 ${
                      active
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-6 opacity-0"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px w-10 bg-primary/60" />
                      <span className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
                        {product.name}
                      </span>
                    </div>
                    
                 <p className="max-w-lg text-sm leading-relaxed xl:text-base">
  <span className="text-2xl font-semibold text-foreground">
    {product.title}
  </span>{" "}
  {product.description}
</p>
                    

                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
                      >
                        Дэлгэрэнгүй
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* ==================== Mobile: босоо accordion ==================== */}
        <div className="flex flex-col gap-3 lg:hidden">
          {PRODUCTS.map((product, index) => {
            const active = activeIndex === index;
            const href = (product as { href?: string }).href;

            return (
              <Reveal key={product.id} delay={index * 0.06}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    active ? "border-primary/40 bg-card/40" : "border-border/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="flex w-full items-center gap-4 p-5 text-left"
                    aria-expanded={active}
                  >
                    <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`flex-1 text-lg font-semibold tracking-tight ${
                        active ? "text-gradient" : ""
                      }`}
                    >
                      {product.name}
                    </span>
                    <ArrowUpRight
                      className={`size-5 text-primary transition-transform duration-300 ${
                        active ? "rotate-0" : "rotate-45 opacity-40"
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                      active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-4 px-5 pb-5">
                        <div className="overflow-hidden rounded-xl border border-border/50">
                          <ProductVisual product={product} />
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {product.title}.
                          </span>{" "}
                          {product.description}
                        </p>
                        {href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary"
                          >
                            Дэлгэрэнгүй
                            <ArrowUpRight className="size-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}