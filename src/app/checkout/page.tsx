"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatGhs } from "@/lib/paystack";
import { ShieldCheck, Lock, ArrowLeft, Loader2, AlertCircle, Truck } from "lucide-react";

type DeliveryRange = { label: string; fee: number };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "To be confirmed by phone",
    city: "To be confirmed",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deliveryRanges, setDeliveryRanges] = useState<DeliveryRange[]>([]);
  const [deliveryRange, setDeliveryRange] = useState("");
  const [freeDeliveryPromo, setFreeDeliveryPromo] = useState(false);
  const [deliverySettingsLoaded, setDeliverySettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-settings", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load delivery options.");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const settings = data?.settings || {};
        const ranges = String(settings.deliveryRanges || "")
          .split(/\r?\n/)
          .map((line: string) => {
            const [label, feeText] = line.split("|");
            return { label: (label || "").trim(), fee: Number((feeText || "").trim()) };
          })
          .filter((range: DeliveryRange) => range.label && Number.isFinite(range.fee) && range.fee >= 0);
        setDeliveryRanges(ranges);
        setFreeDeliveryPromo(settings.deliveryFreePromo === "true");
        setDeliverySettingsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setDeliveryRanges([]);
          setDeliverySettingsLoaded(true);
          setErrorMessage("We could not load delivery options. Please refresh the page or contact us.");
        }
      });
    return () => { cancelled = true; };
  }, []);

  const selectedDeliveryRange = deliveryRanges.find((range) => range.label === deliveryRange);
  const deliveryFee = freeDeliveryPromo ? 0 : selectedDeliveryRange?.fee ?? 0;
  const checkoutTotal = subtotal + deliveryFee;

  // Auto-fill if customer is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || "",
        customerEmail: prev.customerEmail || user.email || "",
        customerPhone: prev.customerPhone || user.phone || "",
      }));
    }
  }, [user]);

  // If cart is empty, redirect
  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      router.push("/cart");
    }
  }, [items, router, isLoading]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!freeDeliveryPromo && !selectedDeliveryRange) {
      setErrorMessage("Please select a delivery range before continuing.");
      return;
    }
    if (!deliverySettingsLoaded) {
      setErrorMessage("Please wait while delivery options finish loading.");
      return;
    }
    setIsLoading(true);

    try {
      // Call server initialization endpoint
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deliveryRange,
          userId: user?.id || null,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to initialize payment transaction.");
      }

      // Store current checkout reference for callback verification
      sessionStorage.setItem("last_aura_order_ref", data.reference);
      sessionStorage.setItem("last_aura_order_id", data.orderId);

      // Redirect customer to Paystack official authorization URL
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("No payment authorization URL was returned.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment initialization failed";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-white pb-12 pt-28 sm:pb-16 sm:pt-32 lg:pt-36">
      <div className="px-4 sm:px-6 lg:px-[4vw]">
        {/* Navigation Back */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-black/60 transition-colors hover:text-[var(--primary)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cart</span>
          </Link>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: Checkout Form */}
          <div className="border border-black/10 bg-white p-6 sm:p-10 lg:col-span-7">
            <div className="mb-8">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
                EXPRESS DISPATCH
              </span>
              <h1 className="font-serif-luxury text-2xl font-medium text-black sm:text-3xl">
                Contact &amp; <span className="italic font-serif-luxury">Order Details.</span>
              </h1>
              {!user && (
                <p className="mt-2 text-xs leading-5 text-black/60">
                  Checking out as Guest.{" "}
                  <Link href="/login" className="font-semibold text-[var(--primary)] underline underline-offset-4">
                    Log in
                  </Link>{" "}
                  to link this order to your account.
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="mb-6 flex items-center gap-2 border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handlePayNow} className="space-y-5">
              {/* Customer Name */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="e.g. Amara Mensah"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 transition-colors focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    placeholder="amara@example.com"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 transition-colors focus:border-[var(--primary)] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-black/50">Receipt &amp; tracking will be sent here.</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                    Phone / Mobile Money *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    placeholder="+233 24 123 4567"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 transition-colors focus:border-[var(--primary)] focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-black/50">For delivery driver contact.</p>
                </div>
              </div>

              <div className="space-y-3 border border-black/10 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-black">Delivery range</h2>
                </div>
                {freeDeliveryPromo ? (
                  <p className="text-sm text-black/70">Free delivery is currently active. No delivery fee will be added.</p>
                ) : (
                  <>
                    <label htmlFor="deliveryRange" className="block text-xs text-black/65">Select the delivery area that applies to you *</label>
                    <select
                      id="deliveryRange"
                      name="deliveryRange"
                      required
                      value={deliveryRange}
                      onChange={(event) => { setDeliveryRange(event.target.value); setErrorMessage(""); }}
                      disabled={!deliverySettingsLoaded || deliveryRanges.length === 0}
                      className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:bg-black/5"
                    >
                      <option value="">{deliverySettingsLoaded ? "Choose your delivery range" : "Loading delivery options..."}</option>
                      {deliveryRanges.map((range) => (
                        <option key={range.label} value={range.label}>{range.label} — {formatGhs(range.fee)}</option>
                      ))}
                    </select>
                    {deliverySettingsLoaded && deliveryRanges.length === 0 && (
                      <p role="alert" className="text-xs leading-5 text-red-700">Delivery ranges have not been configured yet. Please contact us before placing your order.</p>
                    )}
                  </>
                )}
                <p className="text-[11px] leading-5 text-black/55">We will contact you to confirm your exact delivery location before dispatch.</p>
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Any notes about your order..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full resize-y border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 transition-colors focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              {/* Pay With Paystack Action */}
              <div className="space-y-3 border-t border-black/10 pt-6">
                <button
                  type="submit"
                  disabled={isLoading || !deliverySettingsLoaded || (!freeDeliveryPromo && !selectedDeliveryRange)}
                  className="flex w-full items-center justify-center gap-2 bg-[var(--primary)] px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#773B44] disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting to Paystack...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay {formatGhs(checkoutTotal)} via Paystack</span>
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-black/55">
                  <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                  <span>Supports Ghana Mobile Money (MTN, Telecel, AT) and Debit/Credit Cards</span>
                </p>
              </div>
            </form>
          </div>

          {/* Right: Order Overview */}
          <div className="space-y-6 border border-black/10 bg-white p-6 sm:p-8 lg:sticky lg:top-28 lg:col-span-5">
            <h2 className="font-serif-luxury border-b border-black/10 pb-4 text-xl font-semibold text-[var(--primary)]">
              Order Items ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>

            {/* List */}
            <div className="max-h-80 space-y-3 divide-y divide-black/10 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.productId} className="pt-3 first:pt-0 flex items-center gap-4">
                  <div className="relative h-[4.5rem] w-16 shrink-0 overflow-hidden bg-[var(--primary)]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <h4 className="font-serif-luxury text-sm font-semibold text-[var(--primary)]">
                      {item.name}
                    </h4>
                    <p className="text-[10px] uppercase text-black/50">
                      Qty: {item.quantity} • {item.size}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-black">
                    {formatGhs(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t border-black/10 pt-4 text-xs text-black/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-black">{formatGhs(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-black">{freeDeliveryPromo ? "Free" : selectedDeliveryRange ? formatGhs(deliveryFee) : "Select a range"}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-3 text-base font-bold text-black">
                <span>Total Due</span>
                <span>{formatGhs(checkoutTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
