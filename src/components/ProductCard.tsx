"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatGhs } from "@/lib/paystack";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const isInCart = items.some((item) => item.productId === product.id);
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : null;

  return (
    <article className="group min-w-0">
      <Link
        href={`/shop/${product.slug}`}
        className="relative mb-3 block aspect-square overflow-hidden bg-[var(--primary)]"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04] sm:p-5"
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 16vw"
        />
        {(discount || product.isSale) && (
          <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-medium text-[#252522] sm:left-3 sm:top-3 sm:text-[10px]">
            {discount ? `${discount}% off` : "On sale"}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-medium uppercase tracking-wide text-[#615B56] sm:bottom-3 sm:left-3 sm:text-[10px]">
            Sold out
          </span>
        )}
      </Link>

      <Link href={`/shop/${product.slug}`} className="block min-w-0">
        <h3 className="truncate text-[12px] font-medium uppercase leading-snug tracking-[0.025em] text-[#242421] sm:text-[13px]">
          {product.name} <span className="font-normal text-[#74746D]">[{product.size}]</span>
        </h3>
      </Link>
      <p className="mt-1 truncate text-[9px] uppercase tracking-[0.12em] text-[#77776F] sm:text-[10px]">
        {product.scentNotes}
      </p>

      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          <span className="text-[11px] font-medium text-[#242421] sm:text-xs">
            {formatGhs(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[9px] text-[#83837C] line-through sm:text-[10px]">
              {formatGhs(product.originalPrice!)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => addItem(product, 1)}
          disabled={!product.inStock}
          aria-label={`${isInCart ? "Add another" : "Add"} ${product.name} to cart`}
          className="shrink-0 rounded-full border border-[#252522] px-3 py-1 text-[10px] font-medium text-[#252522] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white disabled:cursor-not-allowed disabled:border-[#C9C9C1] disabled:text-[#989891] sm:px-3.5 sm:text-[11px]"
        >
          {isInCart ? <span className="flex items-center gap-1"><Check size={12} /> Added</span> : "Add"}
        </button>
      </div>
    </article>
  );
}
