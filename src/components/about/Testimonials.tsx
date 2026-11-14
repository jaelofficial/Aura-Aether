"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getClientSiteSettings } from "@/lib/site-settings-client";
import { DEFAULT_CLIENT_NOTES, type ClientNote } from "@/lib/site-content";

export default function Testimonials() {
  const [notes, setNotes] = useState<ClientNote[]>(DEFAULT_CLIENT_NOTES);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getClientSiteSettings().then((settings) => {
      if (!settings.clientNotes) return;
      try {
        const parsed = JSON.parse(settings.clientNotes);
        if (Array.isArray(parsed)) {
          setNotes(parsed.filter((note): note is ClientNote =>
            !!note && typeof note.id === "string" && typeof note.name === "string" &&
            typeof note.location === "string" && typeof note.message === "string" &&
            typeof note.signoff === "string"
          ));
        }
      } catch {
        // Keep the built-in notes if an older or invalid setting is stored.
      }
    });
  }, []);

  function scrollCards(direction: -1 | 1) {
    const carousel = carouselRef.current;
    const firstCard = carousel?.querySelector<HTMLElement>("article");
    if (!carousel || !firstCard) return;
    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
    carousel.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: "smooth" });
  }

  return (
    <section aria-label="Customer testimonials" className="bg-white px-5 py-16 sm:px-8 lg:px-[4vw] lg:py-24">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9A765F]">Kind words</p>
        <h2 className="mt-3 font-serif-luxury text-3xl text-[#17110F] sm:text-4xl">Notes from our clients.</h2>
      </div>
      <div ref={carouselRef} className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:gap-7">
        {notes.map((note) => (
          <article key={note.id} className="relative flex min-h-[290px] flex-col bg-[#222A37] px-6 pb-7 pt-10 text-[#F8E7DE] shadow-[0_16px_38px_rgba(25,32,43,0.12)] sm:px-8 sm:pt-12">
            <span aria-hidden="true" className="absolute -top-2 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[-2deg] bg-[#E9D7D3]/90 shadow-sm" />
            <blockquote className="flex-1 text-sm leading-7 sm:text-[15px]">“{note.message}”</blockquote>
            <div className="mt-7 border-t border-white/15 pt-4">
              <p className="text-sm font-semibold">{note.name}</p>
              {note.location && <p className="mt-1 text-xs text-white/65">{note.location}</p>}
              {note.signoff && <p className="mt-4 font-serif-luxury text-xl italic text-[#EBCFC4]">{note.signoff}</p>}
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-6 flex max-w-[1500px] justify-end gap-2 sm:hidden">
        <button type="button" aria-label="Previous testimonial" onClick={() => scrollCards(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-colors hover:bg-[#303b4d]">
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Next testimonial" onClick={() => scrollCards(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-colors hover:bg-[#303b4d]">
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
