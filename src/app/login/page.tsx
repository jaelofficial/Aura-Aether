"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } else {
      setError(res.error || "Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-[4vw] lg:pt-36">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden border border-black/10 md:min-h-[560px] md:grid-cols-2">
        <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--primary)] p-8 text-white sm:p-12 lg:p-14">
          <span aria-hidden="true" className="pointer-events-none absolute -right-12 top-8 select-none font-serif-luxury text-[15rem] leading-none text-white/[0.07]">A</span>
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/75">Aura &amp; Aether · Client portal</p>
            <h1 className="mt-16 max-w-sm font-serif-luxury text-5xl leading-[1.05] sm:text-6xl">
              Welcome <span className="italic">back.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/80">
              Sign in to revisit your orders and keep your favorite fragrances close.
            </p>
          </div>
          <p className="relative mt-16 border-t border-white/25 pt-5 text-[10px] uppercase tracking-[0.18em] text-white/70">
            Find the scent that feels like you.
          </p>
        </div>

        <div className="flex flex-col justify-center bg-white p-7 sm:p-10 lg:p-14">
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Client access</p>
            <h2 className="mt-2 font-serif-luxury text-3xl text-black sm:text-4xl">Sign in</h2>
            <p className="mt-2 text-xs leading-5 text-black/60">Access your order history and fragrance preferences.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-black" htmlFor="login-email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-3 h-4 w-4 text-[var(--primary)]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="amara@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-0 border-b border-black/25 bg-transparent py-3 pl-7 pr-2 text-sm text-black placeholder:text-black/35 focus:border-[var(--primary)] focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-black" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-3 h-4 w-4 text-[var(--primary)]" />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-0 border-b border-black/25 bg-transparent py-3 pl-7 pr-2 text-sm text-black placeholder:text-black/35 focus:border-[var(--primary)] focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-[var(--primary)] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors disabled:opacity-60"
            >
              <span>{isLoading ? "Signing in..." : "Sign in to your account"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-7 space-y-3 text-xs text-black/60">
            <p>
              New to Aura &amp; Aether?{" "}
              <Link href="/register" className="font-semibold text-[var(--primary)] underline underline-offset-4">
                Create an account
              </Link>
            </p>
            <Link href="/shop" className="inline-block text-black/60 transition-colors hover:text-[var(--primary)]">
              Continue shopping as guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
