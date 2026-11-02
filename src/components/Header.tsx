"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Shield, User as UserIcon, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import SearchModal from "./SearchModal";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Gift Sets", href: "/gift-sets" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const iconClass = "h-6 w-6 shrink-0";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const headerTheme = pathname === "/about" || pathname === "/contact" || pathname.startsWith("/shop") || pathname === "/gift-sets" || pathname === "/login" || pathname === "/register" ? "color" : "light";
  const isColorHeader = headerTheme === "color";
  const overlaysHero = isHome || pathname === "/about" || pathname === "/contact" || pathname === "/shop" || pathname === "/gift-sets" || pathname === "/login" || pathname === "/register" || pathname === "/cart" || pathname === "/checkout";
  const { itemCount, openCart } = useCart();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [brandName, setBrandName] = useState("Aura & Aether Parfums");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.brandName) setBrandName(data.settings.brandName);
        const colors = data?.settings || {};
        if (/^#[0-9a-f]{6}$/i.test(colors.primaryColor || "")) {
          document.documentElement.style.setProperty("--primary", colors.primaryColor);
          document.documentElement.style.setProperty("--foreground", colors.primaryColor);
        }
        if (/^#[0-9a-f]{6}$/i.test(colors.accentColor || "")) document.documentElement.style.setProperty("--accent-copper", colors.accentColor);
        if (/^#[0-9a-f]{6}$/i.test(colors.backgroundColor || "")) document.documentElement.style.setProperty("--background", colors.backgroundColor);
      })
      .catch(() => undefined);
  }, []);

  const pillClass = `flex items-center rounded-[20px] px-5 py-3.5 text-sm font-medium shadow-sm ${isColorHeader ? "bg-[var(--primary)] text-white" : "bg-white text-[#1e1e1e]"}`;
  const mobilePillClass = `flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm font-medium shadow-sm ${isColorHeader ? "bg-[var(--primary)] text-white" : "bg-white text-[#1e1e1e]"}`;
  const linkClass = "transition-opacity hover:opacity-60";

  return (
    <>
      <header className={`${overlaysHero ? "absolute" : "sticky"} left-0 right-0 top-0 z-40 w-full ${overlaysHero ? "bg-transparent" : "border-b border-[#EEE9E4] bg-[#FFFEFC]/95 backdrop-blur-md"}`}>
        <div className="relative flex w-full items-center justify-between px-4 py-5 sm:px-6 lg:px-[4vw] lg:py-7">
          <nav aria-label="Main navigation" className={`${pillClass} hidden gap-6 lg:flex`}>
            <Link href="/" className={linkClass}>Home</Link>
            <Link href="/shop" className={`${linkClass} flex items-center gap-1.5`}>Shop</Link>
            <Link href="/gift-sets" className={linkClass}>Gifts</Link>
            <span aria-hidden="true" className={`h-6 w-px ${isColorHeader ? "bg-white/25" : "bg-[#E6E6E6]"}`} />
            <button type="button" aria-label="Search products" onClick={() => setIsSearchOpen(true)} className={linkClass}>
              <Image src="/images/naya-icons/search.svg" alt="" width={23} height={23} className={`${iconClass} ${isColorHeader ? "brightness-0 invert" : ""}`} />
            </button>
          </nav>

          <Link href="/" aria-label={brandName} className={`absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center whitespace-nowrap transition-opacity hover:opacity-80 ${isColorHeader ? "text-white" : "text-[var(--primary)]"}`}>
            <span className="font-[cursive] text-[17px] font-semibold tracking-normal sm:text-xl">𝓐𝓾𝓻𝓪 &amp; 𝓐𝓮𝓽𝓱𝓮𝓻</span>
            <span className="mt-0.5 text-[10px] font-semibold tracking-normal sm:text-xs">𝓟𝓪𝓻𝓯𝓾𝓶𝓼 ✨</span>
          </Link>

          <nav aria-label="Account and shopping" className={`${pillClass} ml-auto hidden gap-5 lg:flex`}>
            <Link href="/about" className={linkClass}>Our Story</Link>
            <Link href="/contact" className={linkClass}>Contact</Link>
            <span aria-hidden="true" className={`h-6 w-px ${isColorHeader ? "bg-white/25" : "bg-[#E6E6E6]"}`} />
            <Link href={user ? "/account" : "/login"} aria-label="Account" title={user ? `Signed in as ${user.name}` : "Sign in or register"} className={linkClass}>
              <UserIcon className="h-5 w-5" strokeWidth={1.6} />
            </Link>
            {user?.role === "ADMIN" && <Link href="/admin" aria-label="Admin dashboard" className={linkClass}><Shield className="h-5 w-5" /></Link>}
            <button type="button" onClick={openCart} aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`} className={`${linkClass} relative flex items-center`}>
              <Image src="/images/naya-icons/shopping-basket.svg" alt="" width={23} height={23} className={`${iconClass} ${isColorHeader ? "brightness-0 invert" : ""}`} />
              {itemCount > 0 && <span className={`absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] ${isColorHeader ? "bg-white text-[var(--primary)]" : "bg-[var(--primary)] text-white"}`}>{itemCount}</span>}
            </button>
          </nav>

          <div className={`${mobilePillClass} relative lg:hidden`}>
            <button type="button" onClick={() => setIsMobileMenuOpen((open) => !open)} aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"} className="flex items-center gap-2">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {isMobileMenuOpen && (
              <div className={`absolute left-0 top-full mt-3 flex min-w-44 flex-col gap-4 rounded-xl p-4 text-sm shadow-lg ${isColorHeader ? "bg-[var(--primary)] text-white" : "bg-white text-[#1e1e1e]"}`}>
                {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>{link.name}</Link>)}
                <Link href={user ? "/account" : "/login"} onClick={() => setIsMobileMenuOpen(false)}>{user ? `Account (${user.name})` : "Sign in / Register"}</Link>
                {user?.role === "ADMIN" && <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
            onClick={openCart}
            className={`${mobilePillClass} relative justify-center lg:hidden`}
          >
            <Image src="/images/naya-icons/shopping-basket.svg" alt="" width={20} height={20} className={isColorHeader ? "brightness-0 invert" : ""} />
            {itemCount > 0 && <span className={`absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] ${isColorHeader ? "bg-white text-[var(--primary)]" : "bg-[var(--primary)] text-white"}`}>{itemCount}</span>}
          </button>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
