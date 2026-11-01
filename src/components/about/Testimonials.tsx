"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const testimonials = [
  {
    src: "/images/testimonials/client-note-ama-cropped-navy.jpeg",
    alt: "Client note from Ama in Accra praising a custom fragrance oil blend",
    position: "lg:left-[3%] lg:top-[10%] lg:rotate-[-5deg]",
    layer: 2,
  },
  {
    src: "/images/testimonials/client-note-kofi-cropped-navy.jpeg",
    alt: "Client note from Kofi in East Legon recommending Aura & Aether fragrances",
    position: "lg:left-[27%] lg:top-[18%] lg:rotate-[3deg]",
    layer: 4,
  },
  {
    src: "/images/testimonials/client-note-naa-cropped-navy.jpeg",
    alt: "Client note from Naa in Osu celebrating a custom perfume oil blend",
    position: "lg:left-[52%] lg:top-[9%] lg:rotate-[-3deg]",
    layer: 3,
  },
  {
    src: "/images/testimonials/client-note-elikem-cropped-navy.jpeg",
    alt: "Client note from Elikem praising the fragrance and packaging",
    position: "lg:left-[76%] lg:top-[19%] lg:rotate-[5deg]",
    layer: 6,
  },
  {
    src: "/images/testimonials/client-note-akosua-cropped-navy.jpeg",
    alt: "Client note from Akosua about finding a bold signature fragrance",
    position: "lg:left-[9%] lg:top-[56%] lg:rotate-[4deg]",
    layer: 7,
  },
  {
    src: "/images/testimonials/client-note-yaa-cropped-navy.jpeg",
    alt: "Client note from Yaa about a personalized perfume oil gift",
    position: "lg:left-[37%] lg:top-[62%] lg:rotate-[-5deg]",
    layer: 5,
  },
  {
    src: "/images/testimonials/fragrance-experience-cropped-navy.jpeg",
    alt: "A fragrance experience note for Dede's Scents & Fragrances",
    position: "lg:left-[66%] lg:top-[57%] lg:rotate-[2deg]",
    layer: 1,
  },
];

export default function Testimonials() {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCards(direction: -1 | 1) {
    const carousel = carouselRef.current;
    const firstCard = carousel?.querySelector<HTMLElement>("figure");
    if (!carousel || !firstCard) return;
    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
    carousel.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: "smooth" });
  }

  return (
    <section
      aria-label="Customer testimonials"
      className="relative overflow-hidden bg-white py-8 lg:h-[100svh] lg:min-h-[700px] lg:py-0"
    >
      <div ref={carouselRef} className="relative mx-auto flex max-w-full snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8 lg:absolute lg:inset-0 lg:block lg:overflow-visible lg:px-0 lg:pb-0">
        {testimonials.map((item) => (
          <figure
            key={item.src}
            className={`relative w-[82vw] flex-none snap-center overflow-hidden  transition-transform duration-500 hover:z-20 hover:scale-[1.025] lg:absolute lg:w-[22vw] lg:max-w-[340px] ${item.position}`}
            style={{ zIndex: item.layer }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={1615}
              height={1445}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 22vw"
              className="block h-auto w-full"
            />
          </figure>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2 px-5 sm:px-8 lg:hidden">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => scrollCards(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-colors hover:bg-[#303b4d]"
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => scrollCards(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-colors hover:bg-[#303b4d]"
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
