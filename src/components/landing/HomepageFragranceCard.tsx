"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

export default function HomepageFragranceCard({ product, image, alt, dark = false }: { product: Product; image: string; alt: string; dark?: boolean }) {
  const { addItem } = useCart();
  return (
    <article className="min-w-0">
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className={`relative aspect-[4/5] w-full overflow-hidden ${dark ? "bg-black/10" : "bg-[#F2F0ED]"}`}>
          <Image src={image} alt={alt} fill sizes="(max-width: 640px) 82vw, (max-width: 1024px) 48vw, 31vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          {product.isSale && <span className="absolute left-3 top-3 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#252522]">On sale</span>}
        </div>
        <h3 className={`mt-4 text-lg font-medium ${dark ? "text-white" : "text-[#17110F]"}`}>{product.name}</h3>
        <p className={`mt-2 text-sm ${dark ? "text-white/80" : "text-[#625A54]"}`}>{product.scentNotes}</p>
      </Link>
      <button type="button" onClick={() => addItem(product, 1)} disabled={!product.inStock} className={`mt-4 w-full border px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${dark ? "border-white/70 text-white hover:bg-white hover:text-[#222a37]" : "border-[#252522] text-[#252522] hover:bg-[#252522] hover:text-white"}`}>
        {product.inStock ? "Add to Cart" : "Sold Out"}
      </button>
    </article>
  );
}
