"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";



export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const settings = data?.settings || {};
        const images = [settings.heroImageUrl, settings.heroImageUrl2, settings.heroImageUrl3]
          .filter((url): url is string => typeof url === "string" && url.trim().length > 0);
        setSlides(images);
      })
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 4000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen min-h-[100svh] w-full overflow-hidden bg-[var(--primary)] text-white">
      <div className="absolute inset-0 z-0">
        {slides.map((src, index) => (
          <Image key={src} src={src} alt={`Aura & Aether fragrance campaign ${index + 1}`} fill priority={index === 0} sizes="100vw" className={`object-cover object-center transition-all duration-[1400ms] ease-in-out ${activeSlide === index ? "scale-100 opacity-50" : "scale-[1.035] opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,12,8,0.42)_0%,rgba(18,12,8,0.18)_33%,rgba(18,12,8,0.38)_57%,rgba(18,12,8,0.76)_100%)]" />
      </div>

      <div className="relative z-10 flex h-screen min-h-[100svh] flex-col justify-end px-6 pb-24 pt-32 sm:px-10 sm:pb-28 lg:px-[4vw] lg:pb-[7vh]">
        <div className="ml-auto flex max-w-3xl flex-col items-center text-center sm:items-end sm:text-right">
          <h1 className="max-w-3xl text-3xl font-medium leading-[1.12] tracking-[-0.035em] text-white drop-shadow-lg sm:text-4xl lg:text-[3.5rem]">
            Wear what can’t be seen, scent
            <br className="hidden sm:block" /> that lingers longer than presence.
          </h1>
          <div className="mt-8 flex w-full flex-col items-center justify-end gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link href="/shop" className="flex min-h-[50px] w-full items-center justify-center rounded bg-[var(--primary)] px-7 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-[var(--accent-copper)] sm:w-[210px] sm:text-base">
              Shop Collections
            </Link>
            <Link href="/about" className="flex min-h-[50px] w-full items-center justify-center rounded border border-white/90 bg-transparent px-7 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-white/10 sm:w-[210px] sm:text-base">
              Discover Our Story
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-10 text-[9px] uppercase tracking-[0.22em] text-white/90 drop-shadow sm:bottom-9 sm:left-10 sm:text-[10px] lg:left-[4vw]">
        Aura &amp; Aether · Extrait de Parfum
      </div>
      <div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 sm:bottom-9 sm:right-18" aria-label="Hero slides">
        {slides.length > 1 && slides.map((_, index) => (
          <button key={index} type="button" onClick={() => setActiveSlide(index)} aria-label={`Show hero slide ${index + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === index ? "w-8 bg-white" : "w-2 bg-white/65 hover:bg-white"}`} />
        ))}
      </div>
    </section>
  );
}
