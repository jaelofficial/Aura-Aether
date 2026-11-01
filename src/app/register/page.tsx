"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "Accra",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await register(formData);
    if (res.success) {
      router.push("/account");
    } else {
      setError(res.error || "Failed to create account");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-[4vw] lg:pt-36">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden border border-black/10 bg-white md:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative flex min-h-52 flex-col justify-between overflow-hidden bg-[var(--primary)] p-7 text-white sm:p-10 md:min-h-[560px]">
          <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">AURA &amp; AETHER</span>
          <div className="relative z-10 max-w-sm py-8">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">A more personal ritual</p>
            <h2 className="font-serif-luxury text-4xl leading-[1.05] sm:text-5xl">Make room for a scent that feels like you.</h2>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/80">Save your details for a smoother checkout and keep your fragrance discoveries close.</p>
          </div>
          <span className="relative z-10 text-xs text-white/70">An invitation to find your signature.</span>
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-8 font-serif-luxury text-[15rem] leading-none text-white/[0.06]">A</span>
        </aside>
        <div className="p-6 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="mb-8">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
              HAUTE PERFUMERY CIRCLE
            </span>
            <h1 className="font-serif-luxury text-3xl font-medium text-black">
              Create an <span className="italic font-serif-luxury">Account.</span>
            </h1>
            <p className="mt-2 text-xs font-light leading-5 text-black/60">
              Enjoy streamlined checkouts and track your previous orders.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Amara Mensah"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="amara@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+233 24 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                  City / Region
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black focus:border-[var(--primary)] focus:outline-none"
                >
                  <option value="Accra">Greater Accra</option>
                  <option value="Kumasi">Kumasi</option>
                  <option value="Takoradi">Sekondi-Takoradi</option>
                  <option value="Cape Coast">Cape Coast</option>
                  <option value="Tamale">Tamale</option>
                  <option value="Other Ghana Location">Other Location</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-black/65">
                Default Delivery Address
              </label>
              <input
                type="text"
                placeholder="e.g. 14 Senchi Street, Airport Residential"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 bg-[var(--primary)] px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors disabled:opacity-60"
            >
              <span>{isLoading ? "Creating Account..." : "Register Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-xs text-black/60">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--primary)] underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
