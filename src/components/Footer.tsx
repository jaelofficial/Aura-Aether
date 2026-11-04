"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [footerDescription, setFooterDescription] = useState("Discover fragrances that feel like you. Find your signature scent, mark a moment, and leave a little magic wherever you go.");
  const [brandName, setBrandName] = useState("Aura & Aether Parfums");
  const [logoUrl, setLogoUrl] = useState("/images/aura-aether-logo.png");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.footerDescription) setFooterDescription(data.settings.footerDescription);
        if (data?.settings?.brandName) setBrandName(data.settings.brandName);
        const configuredLogo = typeof data?.settings?.logoUrl === "string" ? data.settings.logoUrl.trim() : "";
        setLogoUrl(configuredLogo || "/images/aura-aether-logo.png");
      })
      .catch(() => undefined);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer className="bg-[var(--primary)] px-6 pb-8 pt-12 text-white sm:px-10 sm:pb-10 sm:pt-16 lg:px-[4vw]">
      <div className="mx-auto">
        <div className="flex justify-center pb-12 sm:pb-16 lg:pb-20">
          <Link href="/" aria-label={brandName} className="inline-flex items-center transition-opacity hover:opacity-80">
            <Image src={logoUrl} alt={`${brandName} logo`} width={300} height={186} className="h-20 w-auto max-w-[280px] object-contain" onError={() => setLogoUrl("/images/aura-aether-logo.png")} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-b border-white/25 pb-12 sm:gap-x-10 sm:pb-14 lg:grid-cols-[minmax(280px,1.5fr)_repeat(3,minmax(0,1fr))] lg:gap-x-12">
          <div className="col-span-2 space-y-5 lg:col-span-1">
            <p className="max-w-md font-serif-luxury text-lg leading-relaxed text-white sm:text-xl">{footerDescription}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 rounded border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] text-white"><ShieldCheck className="h-4 w-4" /><span>Secured by <strong>Paystack</strong></span></div>
              <span className="text-[11px] text-white/75">Delivery arranged by phone</span>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white">Fragrances</h4>
            <ul className="space-y-3 text-xs leading-relaxed text-white/80">
              <li><Link href="/shop?category=floral" className="transition-colors hover:text-white">Floral Symphonies</Link></li>
              <li><Link href="/shop?category=fresh" className="transition-colors hover:text-white">Fresh &amp; Citrus Accords</Link></li>
              <li><Link href="/shop?category=woody" className="transition-colors hover:text-white">Woody &amp; Earthy Resins</Link></li>
              <li><Link href="/shop?category=amber-spice" className="transition-colors hover:text-white">Amber &amp; Spiced Accords</Link></li>
              <li><Link href="/gift-sets" className="transition-colors hover:text-white">Curated Gift Sets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white">Customer Care</h4>
            <ul className="space-y-3 text-xs leading-relaxed text-white/80">
              <li><Link href="/account" className="transition-colors hover:text-white">My Account</Link></li>
              <li><Link href="/track-order" className="transition-colors hover:text-white">Track an Order</Link></li>
              <li><Link href="/account/orders" className="transition-colors hover:text-white">My Order History</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-white">Contact Boutique</Link></li>
              <li><Link href="/contact#faq" className="transition-colors hover:text-white">Fragrance Consultation FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white">The Scent Circle</h4>
            <p className="mb-4 text-xs leading-relaxed text-white/75">Subscribe for private release invitations and new fragrance updates.</p>
            {subscribed ? <div className="flex items-center gap-2 text-xs text-white"><CheckCircle2 className="h-4 w-4" /><span>Welcome to our private circle.</span></div> : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-3 border-b border-white/65 pb-2">
                <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-xs text-white placeholder-white/60 focus:outline-none" />
                <button type="submit" className="shrink-0 text-xs font-medium transition-opacity hover:opacity-70">Join Circle <span aria-hidden="true">→</span></button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-7 text-xs text-white/75 sm:flex-row">
          <p>© 2026 {brandName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-[#E8BD9E] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/contact" className="hover:text-[#E8BD9E] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
