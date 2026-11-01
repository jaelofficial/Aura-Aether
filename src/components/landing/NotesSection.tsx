"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Product } from "@/types";



function getProductImage(product: Product) {
  return product.images?.find((url) => typeof url === "string" && url.trim() && !url.startsWith("/images/products/")) ||
    (product.image?.trim() && !product.image.startsWith("/images/products/") ? product.image : "");
}

export default function NotesSection({ products }: { products: Product[] }) {
  const images = products.map(getProductImage).filter(Boolean);
  const topLine = (
    <>
      <span>Your scent</span>
      {images[0] && <Image src={images[0]} alt="" width={132} height={62} className="mx-3 inline-block h-[0.62em] w-[1.45em] rounded-full object-cover align-[0.03em] sm:mx-5" />}
      <span>Our priority</span>
      {images[1] && <Image src={images[1]} alt="" width={132} height={62} className="mx-3 inline-block h-[0.62em] w-[1.45em] rounded-full object-cover align-[0.03em] sm:mx-5" />}
    </>
  );
  const bottomLine = (
    <>
      <span>Find your signature</span>
      {images[2] && <Image src={images[2]} alt="" width={132} height={62} className="mx-3 inline-block h-[0.62em] w-[1.45em] rounded-full object-cover align-[0.03em] sm:mx-5" />}
      <span>make every entrance unforgettable</span>
      {images[3] && <Image src={images[3]} alt="" width={132} height={62} className="mx-3 inline-block h-[0.62em] w-[1.45em] rounded-full object-cover align-[0.03em] sm:mx-5" />}
    </>
  );
  const sectionRef = useRef<HTMLElement>(null);
  const topTrackRef = useRef<HTMLDivElement>(null);
  const bottomTrackRef = useRef<HTMLDivElement>(null);
  const offsets = useRef({ top: 0, bottom: 0 });
  const widths = useRef({ top: 0, bottom: 0 });
  const lastScrollY = useRef(0);
  const frame = useRef(0);
  const scrollBoost = useRef(0);

  useEffect(() => {
    const measure = () => {
      if (topTrackRef.current) widths.current.top = topTrackRef.current.scrollWidth / 2;
      if (bottomTrackRef.current) {
        widths.current.bottom = bottomTrackRef.current.scrollWidth / 2;
        bottomTrackRef.current.style.transform = `translate3d(${offsets.current.bottom - widths.current.bottom}px, 0, 0)`;
      }
    };
    const resizeObserver = new ResizeObserver(measure);
    if (topTrackRef.current) resizeObserver.observe(topTrackRef.current);
    if (bottomTrackRef.current) resizeObserver.observe(bottomTrackRef.current);
    measure();

    let isVisible = false;
    let lastFrameTime = 0;
    const animate = (time: number) => {
      if (!isVisible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        frame.current = 0;
        return;
      }

      const elapsed = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.05) : 0;
      lastFrameTime = time;
      const speed = 34 + scrollBoost.current;
      scrollBoost.current *= Math.exp(-elapsed * 2.8);
      offsets.current.top = (offsets.current.top + speed * elapsed) % (widths.current.top || 1);
      offsets.current.bottom = (offsets.current.bottom + speed * elapsed) % (widths.current.bottom || 1);
      if (topTrackRef.current) topTrackRef.current.style.transform = `translate3d(${-offsets.current.top}px, 0, 0)`;
      if (bottomTrackRef.current) {
        bottomTrackRef.current.style.transform = `translate3d(${offsets.current.bottom - (widths.current.bottom || 1)}px, 0, 0)`;
      }
      frame.current = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!frame.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        lastFrameTime = 0;
        frame.current = requestAnimationFrame(animate);
      }
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) startAnimation();
      else {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        lastFrameTime = 0;
      }
    });
    if (sectionRef.current) visibilityObserver.observe(sectionRef.current);

    const updateOnScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      lastScrollY.current = currentY;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        scrollBoost.current = Math.min(scrollBoost.current + Math.abs(delta) * 1.4, 360);
        if (isVisible) startAnimation();
      }
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", updateOnScroll, { passive: true });
    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", updateOnScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="A note on fragrance" className="overflow-hidden bg-white py-24 text-[#171513] sm:py-32 lg:py-40">
      <div className="space-y-3 sm:space-y-5 lg:space-y-20">
        <div role="group" className="overflow-hidden whitespace-nowrap" aria-label="Leave a little mystery, carry the golden hour wherever you go.">
          <div ref={topTrackRef} className="flex w-max items-center font-serif-luxury text-[clamp(2.8rem,8vw,8.5rem)] leading-[1.05] tracking-[-0.055em] will-change-transform">
            <div className="flex shrink-0 items-center">{topLine}</div>
            <div aria-hidden="true" className="flex shrink-0 items-center">{topLine}</div>
          </div>
        </div>
        <div role="group" className="overflow-hidden whitespace-nowrap" aria-label="Find your signature, make every entrance unforgettable, leave a little of you behind.">
          <div ref={bottomTrackRef} className="flex w-max items-center font-serif-luxury text-[clamp(2.8rem,8vw,8.5rem)] leading-[1.05] tracking-[-0.055em] will-change-transform">
            <div className="flex shrink-0 items-center">{bottomLine}</div>
            <div aria-hidden="true" className="flex shrink-0 items-center">{bottomLine}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
