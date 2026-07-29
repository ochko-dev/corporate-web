"use client";

import { forwardRef } from "react";
import type { Product } from "@/src/lib/data/products";

/** ProductsSection queries `.product-title` / `.product-description` /
 *  `.product-cta` inside the returned ref to sequence the crossfade
 *  against its GSAP timeline. */
export const ProductContent = forwardRef<HTMLDivElement, { product: Product }>(
  function ProductContent({ product }, ref) {
    return (
      <div ref={ref} className="flex flex-col items-start gap-6 text-left">
        <h3 className="product-title max-w-md text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {product.title}
        </h3>
        <p className="product-description max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          {product.description}
        </p>

        {/* <Button
          render={<a href={product.cta.href} />}
          nativeButton={false}
          size="lg"
          className="product-cta mt-2 rounded-full px-6"
        >
          {product.cta.label}
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button> */}
      </div>
    );
  },
);
