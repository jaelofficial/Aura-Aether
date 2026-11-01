"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const size = 44;
const strokeWidth = 2;
const radius = (size - strokeWidth * 2) / 2;
const circumference = 2 * Math.PI * radius;

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

      setScrollProgress(Math.min(Math.max(progress, 0), 100));
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    updateScrollState();

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 print:hidden sm:bottom-8 sm:right-8">
      <div
        aria-hidden="true"
        className={`hidden items-center gap-2 border border-[var(--primary)]/20 bg-white px-3 py-1.5 text-xs text-black/65 shadow-lg transition-all duration-200 sm:flex ${isHovered ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0"
          }`}
      >
        <span className="font-medium uppercase tracking-[0.14em]">Top</span>
        <span className="font-semibold tabular-nums text-[var(--primary)]">{Math.round(scrollProgress)}%</span>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-label={`Scroll to top, ${Math.round(scrollProgress)} percent down the page`}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--primary)]/25 bg-white text-[var(--primary)] shadow-lg transition duration-200 hover:scale-105 hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222a37] focus-visible:ring-offset-2 active:scale-95"
      >
        <svg width={size} height={size} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(145, 74, 83, 0.12)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#222a37"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (scrollProgress / 100) * circumference}
            className="transition-[stroke-dashoffset] duration-150 ease-out group-hover:stroke-white"
          />
        </svg>
        <ArrowUp className="relative h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" strokeWidth={2.2} />
      </button>
    </div>
  );
}
