"use client";

import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

export default function HomepageAddButton({ product, dark = false }: { product: Product; dark?: boolean }) {
  const { addItem } = useCart();
  return (
    <button type="button" onClick={() => addItem(product, 1)} disabled={!product.inStock} className={`mt-4 w-full border px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${dark ? "border-white/70 text-white hover:bg-white hover:text-[#222a37]" : "border-[#252522] text-[#252522] hover:bg-[#252522] hover:text-white"}`}>
      {product.inStock ? "Add to Cart" : "Sold Out"}
    </button>
  );
}
