import { Sparkles, Vote, Bot, type LucideIcon } from "lucide-react";

export type ProductVisualKind = "intelligence" | "map" | "analytics";

/** Structural metadata only — name/title/description are translated at
 *  render time from the `products.items.<id>` namespace in messages/*.json. */
export interface ProductMeta {
  id: ProductVisualKind;
  icon: LucideIcon;
  visual: ProductVisualKind;
}

export interface Product extends ProductMeta {
  name: string;
  title: string;
  description: string;
  // cta: { label: string; href: string };
}

/** Content and scroll-choreography constants for the pinned Products
 *  showcase. ProductsSection pins the section for this scroll distance and
 *  splits it into `PRODUCTS_META.length` equal segments — one per product. */
export const PRODUCTS_PIN_DISTANCE = "+=260%";

export const PRODUCTS_META: ProductMeta[] = [
  { id: "intelligence", icon: Sparkles, visual: "intelligence" },
  { id: "map", icon: Vote, visual: "map" },
  { id: "analytics", icon: Bot, visual: "analytics" },
];
