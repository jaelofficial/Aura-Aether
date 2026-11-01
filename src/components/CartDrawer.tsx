"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatGhs } from "@/lib/paystack";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, subtotal, deliveryFee, total } =
    useCart();
  const router = useRouter();

  useEffect(() => {
    if (!isCartOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
      className="fixed inset-0 z-[120] overflow-hidden"
    >
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-[2px]"
        onClick={closeCart}
      />

      <aside className="absolute inset-y-0 right-0 flex w-screen max-w-[480px] flex-col border-l border-black/10 bg-white shadow-2xl">
        <div className="h-1.5 shrink-0 bg-[var(--primary)]" />
        <header className="flex items-center justify-between border-b border-black/10 px-6 py-5 sm:px-8">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-[var(--primary)]">Aura &amp; Aether</p>
            <div className="mt-1 flex items-baseline gap-2.5">
              <h2 id="cart-title" className="font-serif-luxury text-2xl text-black">Your bag</h2>
              <span className="text-[11px] text-black/55">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart drawer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-black transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                <ShoppingCart className="h-7 w-7" strokeWidth={1.3} />
              </div>
              <h3 className="mt-6 font-serif-luxury text-xl text-black">Your bag is waiting</h3>
              <p className="mt-2 max-w-[260px] text-xs leading-5 text-black/60">
                Discover a fragrance that feels unmistakably yours.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  router.push("/shop");
                }}
                className="mt-6 inline-flex items-center gap-2 bg-[var(--primary)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#773B44]"
              >
                Explore fragrances <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {items.map((item) => (
                <article key={item.productId} className="flex gap-4 py-5 sm:gap-5">
                  <Link
                    href={`/shop/${item.slug}`}
                    onClick={closeCart}
                    aria-label={`View ${item.name}`}
                    className="relative h-[112px] w-[92px] shrink-0 overflow-hidden bg-[var(--primary)] sm:h-[128px] sm:w-[104px]"
                  >
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="104px" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif-luxury text-lg leading-tight text-[var(--primary)] transition-colors hover:text-[#773B44]"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/45 transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-black/55">
                        {item.size}{item.scentNotes ? ` · ${item.scentNotes}` : ""}
                      </p>
                      <p className="mt-2 text-sm font-medium text-black">{formatGhs(item.price)}</p>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div className="flex h-8 items-center border border-black/20">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-full w-8 items-center justify-center text-black transition-colors hover:text-[var(--primary)] disabled:opacity-30"
                        ><Minus className="h-3 w-3" /></button>
                        <span className="w-7 text-center text-[11px] text-black">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-full w-8 items-center justify-center text-black transition-colors hover:text-[var(--primary)] disabled:opacity-30"
                        ><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="text-[10px] text-black/60">{formatGhs(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="shrink-0 border-t border-black/10 bg-white px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span className="text-black">{formatGhs(subtotal)}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Nationwide delivery</span>
                <span className="text-black">{deliveryFee === 0 ? "Calculated at checkout" : formatGhs(deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-3 text-sm font-semibold text-black">
                <span>Estimated total</span>
                <span>{formatGhs(total)}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
                className="flex w-full items-center justify-center gap-2 bg-[var(--primary)] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#773B44]"
              >
                Continue to checkout <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  router.push("/cart");
                }}
                className="w-full border border-black/20 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                View full bag
              </button>
            </div>
            <p className="mt-4 text-center text-[9px] uppercase tracking-[0.12em] text-black/45">Secure checkout with Paystack</p>
          </footer>
        )}
      </aside>
    </div>
  );
}
