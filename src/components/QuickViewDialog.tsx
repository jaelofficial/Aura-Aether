"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, X } from "lucide-react";
import type { Product } from "@/types";
import { formatGhs } from "@/lib/paystack";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

interface QuickViewDialogProps {
  product: Product;
  recommendations: Product[];
}

export default function QuickViewDialog({ product, recommendations }: QuickViewDialogProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;

  const close = () => router.back();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.back();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  const handleAdd = () => {
    if (!product.inStock || product.stock <= 0) return;
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        className="relative max-h-[94svh] w-full max-w-[1180px] overflow-y-auto bg-white text-black shadow-2xl sm:max-h-[90svh]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close product details"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black transition-colors hover:bg-[var(--primary)] hover:text-white sm:right-5 sm:top-5"
        >
          <X size={19} strokeWidth={1.5} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-4 sm:p-7 lg:p-9">
            <div className="grid grid-cols-[54px_minmax(0,1fr)] gap-3 sm:grid-cols-[70px_minmax(0,1fr)] sm:gap-4">
              <div className="flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden border border-[#773B44] bg-[var(--primary)]">
                  <Image src={product.image} alt="" fill className="object-contain p-1" sizes="70px" />
                </div>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--primary)]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-6 sm:p-10"
                  sizes="(max-width: 1024px) 75vw, 44vw"
                />
                {hasDiscount && (
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-wide text-black">
                    {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% off
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 pb-7 sm:px-8 sm:pb-9 lg:px-8 lg:pb-10 lg:pl-3 lg:pt-[4.5rem]">
            <p className="text-[9px] uppercase tracking-[0.22em] text-black sm:text-[10px]">
              {product.scentNotes}
            </p>
            <h1 id="quick-view-title" className="mt-2 font-serif-luxury text-3xl leading-tight text-[var(--primary)] sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-xs text-black">{product.size}</p>
            <p className="mt-5 max-w-xl text-sm leading-6 text-black">
              {product.description.length > 120 ? `${product.description.slice(0, 117).trimEnd()}…` : product.description}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-xl font-medium text-black">{formatGhs(product.price)}</span>
              {hasDiscount && (
                <span className="text-sm text-black/60 line-through">{formatGhs(product.originalPrice!)}</span>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <div className="flex h-12 items-center border border-black/30 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                  className="px-3 text-black hover:text-[var(--primary)]"
                ><Minus size={14} /></button>
                <span className="min-w-6 text-center text-xs">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(Math.max(product.stock, 1), value + 1))}
                  aria-label="Increase quantity"
                  className="px-3 text-black hover:text-[var(--primary)]"
                ><Plus size={14} /></button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!product.inStock || product.stock <= 0}
                className={`flex h-12 flex-1 items-center justify-center gap-2 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors sm:text-xs ${!product.inStock || product.stock <= 0
                    ? "cursor-not-allowed bg-[#A99C92]"
                    : added
                      ? "bg-[#506246]"
                      : "bg-[var(--primary)] hover:bg-[#773B44]"
                  }`}
              >
                {added && <Check size={15} />}
                {added ? "Added to bag" : product.inStock ? "Add to bag" : "Sold out"}
              </button>
            </div>

            <div className="mt-7 border-t border-[#E3DAD0]">
              <details open className="group border-b border-black/15 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-black">
                  Description <span className="text-base leading-none transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="pt-3 text-xs leading-6 text-black">{product.description}</p>
              </details>
              <details className="group border-b border-black/15 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-black">
                  Composition <span className="text-base leading-none transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="space-y-2 pt-3 text-xs leading-5 text-black">
                  {product.topNotes && <p><span className="font-medium">Top:</span> {product.topNotes}</p>}
                  {product.heartNotes && <p><span className="font-medium">Heart:</span> {product.heartNotes}</p>}
                  {product.baseNotes && <p><span className="font-medium">Base:</span> {product.baseNotes}</p>}
                  {!product.topNotes && !product.heartNotes && !product.baseNotes && <p>{product.scentNotes}</p>}
                </div>
              </details>
              <details className="group border-b border-black/15 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-black">
                  How to wear <span className="text-base leading-none transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="pt-3 text-xs leading-6 text-black">Apply to pulse points and allow the fragrance to settle on skin. Store away from direct sunlight and heat.</p>
              </details>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="border-t border-black/15 px-5 py-7 sm:px-8 sm:py-8">
            <h2 className="mb-5 font-serif-luxury text-xl text-black sm:text-2xl">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
              {recommendations.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
