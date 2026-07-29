import Image from "next/image";
import type { Product } from "@/src/lib/data/products";

const IMAGES: Record<Product["visual"], { src: string; width: number; height: number }> = {
  intelligence: { src: "/products_images/product1.png", width: 1815, height: 867 },
  map: { src: "/products_images/product2.png", width: 1928, height: 816 },
  analytics: { src: "/products_images/product3.png", width: 1672, height: 941 },
};

export function ProductVisual({ product }: { product: Product }) {
  const image = IMAGES[product.visual];

  return (
    <div className="w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#061a2b] shadow-glow">
      <Image
        src={image.src}
        alt={product.title}
        width={image.width}
        height={image.height}
        className="h-auto w-full"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    </div>
  );
}
