"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PackageSearch, Search, CheckCircle2, Clock3, Truck, PackageCheck, AlertCircle } from "lucide-react";

type TrackedOrder = {
  orderNumber: string;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";
  createdAt: string;
  updatedAt: string;
};

const stages = [
  { status: "PAID", label: "Order confirmed", description: "Your payment has been confirmed.", icon: CheckCircle2 },
  { status: "PROCESSING", label: "Being prepared", description: "Your order is being prepared.", icon: PackageSearch },
  { status: "SHIPPED", label: "Out for delivery", description: "Your order has been dispatched.", icon: Truck },
  { status: "DELIVERED", label: "Delivered", description: "Your order has been delivered.", icon: PackageCheck },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Accra",
  }).format(new Date(value));
}

function stageIndex(status: TrackedOrder["status"]) {
  if (status === "PENDING") return -1;
  if (status === "PAID") return 0;
  if (status === "PROCESSING") return 1;
  if (status === "SHIPPED") return 2;
  if (status === "DELIVERED") return 3;
  return -2;
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not find that order.");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order tracking is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  const activeStage = order ? stageIndex(order.status) : -1;

  return (
    <div className="min-h-[70vh] bg-[#FCFBF9] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#E8D9CE] bg-white text-[#B77F60]">
            <PackageSearch className="h-6 w-6" />
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#B77F60]">Aura &amp; Aether Parfums</p>
          <h1 className="font-serif-luxury text-3xl font-medium text-[#1C1917] sm:text-4xl">Track your order</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#78716C]">
            Enter the order ID shown after your payment to check the latest status of your order. You do not need an account.
          </p>
        </div>

        <form onSubmit={handleTrack} className="rounded-3xl border border-[#ECE5DD] bg-white p-5 shadow-sm sm:p-7">
          <label htmlFor="orderId" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#4A443F]">Order ID</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="orderId"
              name="orderId"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Enter your order ID"
              autoComplete="off"
              required
              maxLength={40}
              className="min-h-12 min-w-0 flex-1 rounded-full border border-[#DDD6CD] bg-[#FCFBF9] px-5 text-sm text-[#1C1917] outline-none transition focus:border-[#B77F60] focus:ring-2 focus:ring-[#B77F60]/15"
            />
            <button type="submit" disabled={loading || !orderId.trim()} className="aa-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1C1917] px-6 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#38332E] disabled:cursor-not-allowed disabled:opacity-60">
              <Search className="h-4 w-4" /> {loading ? "Checking…" : "Track order"}
            </button>
          </div>
          {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#991B1B]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        </form>

        {order && (
          <section aria-live="polite" className="mt-6 rounded-3xl border border-[#ECE5DD] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-3 border-b border-[#EFE9E2] pb-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C827A]">Order ID</p>
                <h2 className="mt-1 break-all font-serif-luxury text-2xl text-[#1C1917]">{order.orderNumber}</h2>
                <p className="mt-2 text-xs text-[#78716C]">Placed {formatDate(order.createdAt)}</p>
              </div>
              <div className="self-start rounded-full border border-[#E8D9CE] bg-[#FAF7F4] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#5C554F]">
                {order.status.replaceAll("_", " ")}
              </div>
            </div>

            {order.status === "CANCELLED" ? (
              <div className="mt-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
                This order has been cancelled. If you need help, please <Link href="/contact" className="font-semibold underline">contact us</Link>.
              </div>
            ) : order.status === "PENDING" ? (
              <div className="mt-5 flex gap-3 rounded-2xl border border-[#F3E3C5] bg-[#FFFBEB] p-4 text-sm text-[#92400E]">
                <Clock3 className="h-5 w-5 shrink-0" />
                <div><p className="font-semibold">Payment/order confirmation pending</p><p className="mt-1 text-xs leading-5">Your order has not yet been marked as paid. If you completed payment, please allow a moment and try again.</p></div>
              </div>
            ) : (
              <ol className="mt-6 space-y-0">
                {stages.map((stage, index) => {
                  const complete = activeStage >= index;
                  const current = activeStage === index;
                  const Icon = stage.icon;
                  return (
                    <li key={stage.status} className="relative flex gap-4 pb-6 last:pb-0">
                      {index < stages.length - 1 && <span className={`absolute left-[17px] top-9 h-[calc(100%-1.25rem)] w-px ${activeStage > index ? "bg-[#B77F60]" : "bg-[#E8D9CE]"}`} />}
                      <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${complete ? "border-[#B77F60] bg-[#F5E8DF] text-[#8E5E45]" : "border-[#E8D9CE] bg-white text-[#A89F95]"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="pt-0.5">
                        <p className={`text-sm font-semibold ${current ? "text-[#8E5E45]" : complete ? "text-[#1C1917]" : "text-[#A89F95]"}`}>{stage.label}{current ? " · Current status" : ""}</p>
                        <p className="mt-1 text-xs leading-5 text-[#78716C]">{stage.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-6 grid gap-3 border-t border-[#EFE9E2] pt-5 sm:grid-cols-2">
              <div className="rounded-xl bg-[#FAF7F4] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A]">Payment status</p>
                <p className="mt-1 text-sm font-semibold text-[#1C1917]">{order.paymentStatus === "SUCCESS" ? "Paid" : order.paymentStatus === "FAILED" ? "Failed" : order.paymentStatus === "REVERSED" ? "Reversed" : "Pending"}</p>
              </div>
              <div className="rounded-xl bg-[#FAF7F4] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A]">Last updated</p>
                <p className="mt-1 text-sm font-semibold text-[#1C1917]">{formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </section>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-[#8C827A]">
          Need help with your order? <Link href="/contact" className="font-semibold text-[#8E5E45] underline underline-offset-2">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
