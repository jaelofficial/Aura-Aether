"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const defaultSlides = [
  {
    src: "/images/hero/coastal-aqua.jpeg",
    alt: "Aqua perfume on a sunlit coastal terrace",
  },
  {
    src: "/images/hero/desert-amber.jpeg",
    alt: "Amber perfume in a warm garden courtyard",
  },
  {
    src: "/images/hero/emerald-noir.jpeg",
    alt: "Emerald perfume in a dark floral interior",
  },
  {
    src: "/images/hero/city-sillage.jpeg",
    alt: "Golden perfume beside a city cafe",
  },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    let active = true;
    fetch("/api/site-settings").then((response) => response.ok ? response.json() : null).then((data) => {
      if (!active) return;
      const settings = data?.settings || {};
      setSlides(defaultSlides.map((slide, index) => {
        const key = index === 0 ? "heroImageUrl" : `heroImageUrl${index + 1}`;
        const savedImage = settings[key];
        return { ...slide, src: typeof savedImage === "string" && savedImage.trim() ? savedImage : slide.src };
      }));
    }).catch(() => { if (active) setSlides(defaultSlides); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 4000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen min-h-[100svh] w-full overflow-hidden bg-[#241810] text-white">
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover object-center transition-all duration-[1400ms] ease-in-out ${activeSlide === index ? "scale-100 opacity-50" : "scale-[1.035] opacity-0"}`}
          />
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
            <Link href="/shop" className="flex min-h-[50px] w-full items-center justify-center rounded bg-[#222a37] px-7 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#49271c] sm:w-[210px] sm:text-base">
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
        {slides.map((_, index) => (
          <button key={index} type="button" onClick={() => setActiveSlide(index)} aria-label={`Show hero slide ${index + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === index ? "w-8 bg-white" : "w-2 bg-white/65 hover:bg-white"}`} />
        ))}
      </div>
    </section>
  );
}
