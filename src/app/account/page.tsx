"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, Package, LogOut, ArrowRight, ShieldCheck, Settings } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xs text-[#78716C]">Loading account details...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-[#EFE9E2] gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C827A] block mb-1">
              HAUTE CLIENTELE
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1C1917]">
              Welcome, <span className="italic font-serif-luxury">{user.name}.</span>
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D5CDC4] text-xs font-semibold text-[#5C554F] hover:text-[#B91C1C] hover:border-[#B91C1C] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center gap-3 pb-4 border-b border-[#EFE9E2]">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EE] text-[#C59B4B] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1917]">
                  Personal Profile
                </h3>
                <span className="text-[11px] text-[#8C827A]">
                  Role: {user.role === "ADMIN" ? "Boutique Administrator" : "Privileged Client"}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-2 text-[#5C554F]">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "Not specified"}</p>
              <p><strong>Address:</strong> {user.address || "Not specified"}</p>
              <p><strong>City / Region:</strong> {user.city || "Accra"}, Ghana</p>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border border-[#ECE5DD] bg-white p-6 shadow-2xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF5EE] text-[#C59B4B]"><Settings className="h-5 w-5" /></div>
              <div><h3 className="font-serif-luxury text-lg font-semibold text-[#1C1917]">Account Settings</h3><p className="mt-1 text-xs text-[#78716C]">Update your email, password, and personal details.</p></div>
            </div>
            <Link href="/account/settings" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D5CDC4] px-5 py-3 text-xs font-semibold text-[#1C1917] transition hover:border-[#B77F60] hover:bg-[#FAF7F4]">Manage settings <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>

        {/* Orders Quick Access */}
          <div className="bg-white rounded-3xl border border-[#ECE5DD] p-6 sm:p-8 space-y-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-[#EFE9E2]">
                <div className="w-10 h-10 rounded-full bg-[#FAF5EE] text-[#C59B4B] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1917]">
                    Order History
                  </h3>
                  <span className="text-[11px] text-[#8C827A]">
                    Track your orders &amp; delivery statuses
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#78716C] mt-4 font-light leading-relaxed">
                Review all confirmed orders, payment receipts, Paystack references, and courier tracking details.
              </p>
            </div>

            <Link
              href="/account/orders"
              className="aa-button mt-4 w-full py-3.5 px-6 rounded-full bg-[#1C1917] text-[#FAF8F5] text-xs font-bold uppercase tracking-widest hover:bg-[#38332E] transition-all flex items-center justify-center gap-2"
            >
              <span>View Previous Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Admin Link if role is ADMIN */}
        {user.role === "ADMIN" && (
          <div className="p-6 bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-serif-luxury text-base font-semibold text-[#92400E]">
                Administrative Access
              </h4>
              <p className="text-xs text-[#B45309] mt-0.5">
                Manage products, update inventory, and fulfill customer orders.
              </p>
            </div>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-full bg-[#B45309] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#92400E] transition-colors"
            >
              Open Admin Portal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
