"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";
import { formatGhs } from "@/lib/paystack";
import { Package, ArrowLeft, ShieldCheck } from "lucide-react";

export default function OrderHistoryPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        setOrders([]);
      } finally {
        setIsFetching(false);
      }
    };

    if (user) {
      fetchOrders();
    } else if (!isLoading) {
      setIsFetching(false);
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen bg-white pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-[4vw] lg:pt-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-0">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs text-black/60 transition-colors hover:text-[var(--primary)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Account Overview</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 border-b border-black/10 pb-8">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
            PURCHASE ARCHIVES
          </span>
          <h1 className="font-serif-luxury text-3xl font-normal text-black sm:text-4xl">
            Your Previous <span className="italic font-serif-luxury">Orders.</span>
          </h1>
        </div>

        {/* Orders list */}
        {isFetching ? (
          <div className="py-20 text-center text-xs text-black/55">
            Retrieving your order records...
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-black/10 bg-white px-8 py-16 text-center sm:py-20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="font-serif-luxury mb-2 text-2xl font-normal text-[var(--primary)]">
              No orders placed yet
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-xs leading-5 text-black/60">
              When you purchase our perfumes or gift sets, your confirmed orders and receipts
              will appear here.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[var(--primary)] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#773B44]"
            >
              Discover Fragrances
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="space-y-5 border border-black/10 bg-white p-5 sm:p-7">
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4 text-xs">
                  <div>
                    <span className="text-sm font-semibold text-[var(--primary)] sm:text-base">
                      {order.orderNumber}
                    </span>
                    <p className="mt-1 text-[11px] text-black/55">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-GH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${order.status === "PAID"
                          ? "bg-[var(--primary)]/10 text-[#773B44]"
                          : order.status === "DELIVERED"
                            ? "bg-[var(--primary)]/10 text-[#773B44]"
                            : order.status === "SHIPPED"
                              ? "bg-[var(--primary)]/10 text-[#773B44]"
                              : "bg-black/[0.06] text-black/70"
                        }`}
                    >
                      {order.status}
                    </span>

                    <span className="border border-black/10 bg-white px-2.5 py-1 text-[10px] text-black/60">
                      Ref: {order.paymentReference}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="divide-y divide-black/10">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-xs">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-[var(--primary)]">
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-serif-luxury text-sm font-semibold text-[var(--primary)]">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-black/55">
                            Qty: {item.quantity} • {item.size || "50ml"}
                          </p>
                        </div>
                      </div>

                      <span className="font-semibold text-black">
                        {formatGhs(item.productPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total and Delivery Footnote */}
                <div className="flex flex-col items-start justify-between gap-3 border-t border-black/10 pt-4 text-xs sm:flex-row sm:items-center">
                  <div className="text-black/55">
                    <span>Delivered to: <strong className="font-medium text-black">{order.deliveryAddress}, {order.city}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-sm font-semibold text-black">
                      Total: {formatGhs(order.totalAmount)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--primary)]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Paid with Paystack
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
