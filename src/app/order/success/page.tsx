"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, ArrowRight, ShoppingCart, ShieldCheck, RefreshCw, PackageSearch } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Order } from "@/types";
import { formatGhs } from "@/lib/paystack";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const [reference, setReference] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Paystack appends ?reference=... or ?trxref=... on callback
    const ref =
      searchParams.get("reference") ||
      searchParams.get("trxref") ||
      (typeof window !== "undefined" ? sessionStorage.getItem("last_aura_order_ref") : null);

    if (!ref) {
      setError("No transaction reference was found for this order.");
      setIsVerifying(false);
      return;
    }

    setReference(ref);

    // Call server verification endpoint
    const verify = async () => {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: ref }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.order) {
          setOrder(data.order);
          clearCart(); // Order confirmed, clear cart
          sessionStorage.removeItem("last_aura_order_ref");
        } else {
          setError(data.error || "Payment verification could not be confirmed by Paystack.");
        }
      } catch {
        setError("Network communication error while verifying payment with Paystack.");
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [searchParams, clearCart]);

  if (isVerifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EE] flex items-center justify-center mb-6 animate-spin">
          <RefreshCw className="w-8 h-8 text-[#C59B4B]" />
        </div>
        <h2 className="font-serif-luxury text-2xl font-medium text-[#1C1917] mb-2">
          Verifying Paystack Transaction...
        </h2>
        <p className="text-xs text-[#78716C] max-w-sm">
          Please wait while our server authenticates your transaction details directly with Paystack.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#FCA5A5] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#DC2626]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-medium text-[#1C1917]">
            Payment Verification Notice
          </h2>
          <p className="text-xs text-[#78716C] leading-relaxed">
            {error || "We could not verify your payment at this moment."}
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/checkout"
              className="aa-button w-full py-3 px-6 rounded-full bg-[#1C1917] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#38332E]"
            >
              Retry Payment
            </Link>
            <Link
              href="/contact"
              className="text-xs text-[#78716C] hover:underline pt-2"
            >
              Contact customer support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-white rounded-3xl border border-[#ECE5DD] p-8 sm:p-12 shadow-sm text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#10B981] mb-6 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#10B981] block mb-2">
            PAYMENT VERIFIED • ORDER CONFIRMED
          </span>

          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#1C1917] font-normal mb-3">
            Thank you for your order, {order.customerName}.
          </h1>

          <p className="text-sm text-[#6B635B] font-light max-w-lg mx-auto leading-relaxed">
            Your payment of <strong>{formatGhs(order.totalAmount)}</strong> was successfully verified.
            We are preparing your artisanal flacons for dispatch.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 text-xs bg-[#FAF7F4] border border-[#EDE7DF] px-5 py-2.5 rounded-full text-[#4A443F]">
            <span>Order #: <strong>{order.orderNumber}</strong></span>
            <span>•</span>
            <span>Ref: <strong>{order.paymentReference}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#10B981]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Paystack Paid
            </span>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Delivery Information */}
          <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 sm:p-8 space-y-4 shadow-2xs">
            <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1917] pb-3 border-b border-[#EFE9E2]">
              Delivery Destination
            </h3>
            <div className="text-xs space-y-2 text-[#5C554F]">
              <p><strong>Recipient:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>Phone:</strong> {order.customerPhone}</p>
              <p><strong>Address:</strong> {order.deliveryAddress}</p>
              <p><strong>City / Region:</strong> {order.city}, Ghana</p>
              {order.notes && <p><strong>Delivery Notes:</strong> {order.notes}</p>}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 sm:p-8 space-y-4 shadow-2xs">
            <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1917] pb-3 border-b border-[#EFE9E2]">
              Payment Breakdown
            </h3>
            <div className="text-xs space-y-2 text-[#5C554F]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-[#1C1917]">{formatGhs(order.subtotal)}</span>
              </div>
              <p className="rounded-xl bg-[#FAF7F3] p-3 text-[11px] leading-5 text-[#6B635B]">
                Delivery has not been charged here. We will call to confirm your location and arrange an Uber delivery; the courier cost will be discussed before dispatch.
              </p>
              <div className="pt-2 border-t border-[#EFE9E2] flex justify-between text-sm font-bold text-[#1C1917]">
                <span>Total Paid:</span>
                <span>{formatGhs(order.totalAmount)}</span>
              </div>
              <p className="text-[10px] text-[#10B981] pt-1">
                ✓ Settled via Paystack Secure Checkout
              </p>
            </div>
          </div>
        </div>

        {/* Items Purchased */}
        <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 sm:p-8 shadow-2xs mb-10">
          <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1917] pb-4 border-b border-[#EFE9E2] mb-4">
            Flacons &amp; Sets in this Order
          </h3>
          <div className="divide-y divide-[#F5EFEB]">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <div className="w-14 h-16 bg-[#FAF7F4] rounded-lg relative overflow-hidden shrink-0 border border-[#EDE7DF]">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-serif-luxury text-base font-semibold text-[#1C1917]">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-[#8C827A]">
                      Quantity: {item.quantity} • {item.size || "50ml"}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#1C1917]">
                  {formatGhs(item.productPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Actions */}
        <div className="text-center space-x-4">
          <Link
            href="/shop"
            className="aa-button inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1C1917] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#38332E] transition-all"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/track-order"
            className="aa-button inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#D5CDC4] text-xs font-bold uppercase tracking-widest text-[#4A443F] hover:bg-white transition-all"
          >
            <PackageSearch className="w-4 h-4" />
            <span>Track This Order</span>
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#D5CDC4] text-xs font-bold uppercase tracking-widest text-[#4A443F] hover:bg-white transition-all"
          >
            <span>View Order History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-[#78716C]">Loading order details...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
