"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatGhs } from "@/lib/paystack";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-[4vw] lg:pt-36">
        <div className="max-w-md border border-black/10 bg-white p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h1 className="font-serif-luxury mb-2 text-2xl font-medium text-[var(--primary)] sm:text-3xl">
            Your cart is empty
          </h1>
          <p className="mb-8 text-sm font-light leading-relaxed text-black/65">
            Discover our artisanal perfumes and limited-edition gift coffrets to begin your
            sensory voyage.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[var(--primary)] px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#773B44]"
          >
            <span>Explore Fragrance Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pb-12 pt-28 sm:pb-16 sm:pt-32 lg:pt-36">
      <div className="px-4 sm:px-6 lg:px-[4vw]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-8">
          <div>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
              CURRENT SELECTIONS
            </span>
            <h1 className="font-serif-luxury text-3xl font-normal text-[var(--primary)] sm:text-4xl">
              Shopping <span className="italic font-serif-luxury">bag.</span>
            </h1>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-black/60 transition-colors hover:text-[var(--primary)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Continue Shopping</span>
          </Link>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col items-start justify-between gap-6 border-b border-black/10 bg-white py-5 sm:flex-row sm:items-center sm:py-6"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--primary)] sm:h-28 sm:w-24">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-serif-luxury text-lg font-semibold text-[var(--primary)] transition-colors hover:text-[#773B44] sm:text-xl"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-black/55 sm:text-xs">
                      {item.size}{item.scentNotes ? ` · ${item.scentNotes}` : ""}
                    </p>
                    <p className="text-sm font-semibold text-black">
                      {formatGhs(item.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity & Controls */}
                <div className="flex w-full items-center justify-between gap-6 border-t border-black/10 pt-3 sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
                  <div className="flex items-center border border-black/20">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1 text-black transition-colors hover:text-[var(--primary)] disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-black">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1 text-black transition-colors hover:text-[var(--primary)] disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-24">
                    <span className="text-sm font-semibold text-black">
                      {formatGhs(item.price * item.quantity)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="p-2 text-black/45 transition-colors hover:text-[var(--primary)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="sticky top-28 space-y-6 border border-black/10 bg-white p-6 sm:p-8 lg:col-span-4">
            <h2 className="font-serif-luxury border-b border-black/10 pb-4 text-xl font-semibold text-[var(--primary)]">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-black/65">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-black">{formatGhs(subtotal)}</span>
              </div>
              <div className="border-l-2 border-[var(--primary)] bg-[var(--primary)]/[0.06] p-3 text-[11px] leading-5 text-black/70">
                We will call to confirm your delivery location and Uber delivery cost after your order. No delivery fee is added here.
              </div>
              <div className="flex justify-between border-t border-black/10 pt-3 text-base font-bold text-black">
                <span>Total Amount</span>
                <span>{formatGhs(total)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 bg-[var(--primary)] px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#773B44]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/shop"
                className="block py-2 text-center text-xs text-black/60 transition-colors hover:text-[var(--primary)]"
              >
                Add more items
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
