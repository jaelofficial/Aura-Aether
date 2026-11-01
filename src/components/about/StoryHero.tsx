"use client";

import Image from "next/image";
import { useEffect, useState } from "react";



export default function StoryHero() {
  const [activeImage, setActiveImage] = useState(0);
  const [storyImages, setStoryImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/site-settings").then((res) => res.ok ? res.json() : null).then((data) => {
      const settings = data?.settings || {};
      setStoryImages([settings.aboutStoryImage1, settings.aboutStoryImage2, settings.aboutStoryImage3, settings.aboutStoryImage4].filter((url): url is string => typeof url === "string" && url.trim().length > 0));
    }).catch(() => setStoryImages([]));
  }, []);

  useEffect(() => {
    if (storyImages.length < 2) return;
    const timer = window.setInterval(() => setActiveImage((current) => (current + 1) % storyImages.length), 6000);
    return () => window.clearInterval(timer);
  }, [storyImages.length]);

  return (
    <section className="relative flex w-full flex-col overflow-hidden bg-white text-[#17110F] sm:block sm:h-[100svh] sm:min-h-[560px]">
      <div className="relative order-2 h-[58svh] min-h-[360px] bg-[#eee8e1] sm:absolute sm:inset-x-0 sm:bottom-0 sm:h-[60%] sm:min-h-0">
        {storyImages.map((src, index) => (
          <div key={src} className={`absolute inset-0 transition-opacity duration-[1400ms] ${activeImage === index ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <Image src={src} alt={`Aura & Aether brand story image ${index + 1}`} fill priority={index === 0} sizes="100vw" className="object-cover object-center" />
          </div>
        ))}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 sm:bottom-6 sm:right-6" aria-label="Story images">
          {storyImages.length > 1 && storyImages.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`Show story image ${index + 1}`}
              aria-current={activeImage === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === index ? "w-8 bg-white" : "w-2 bg-white/65 hover:bg-white"}`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 order-1 mx-auto flex max-w-[1600px] flex-col items-center px-4 pb-8 pt-32 text-center sm:absolute sm:inset-x-0 sm:top-0 sm:mx-auto sm:h-full sm:px-6 sm:pb-0 sm:pt-[12svh] lg:px-[4vw]">
        <p className="mx-auto inline-flex items-center rounded-full border border-black/20 px-4 py-2 text-[10px] font-medium tracking-[0.12em] sm:text-xs">
          Our story <span className="ml-2 text-base leading-none" aria-hidden="true">✳</span>
        </p>
        <p className="mx-auto mt-4 max-w-2xl font-serif-luxury text-sm leading-snug sm:mt-5 sm:text-xl lg:text-2xl">
          Wear what can’t be seen, scent<br className="hidden sm:block" /> that lingers longer than presence.
        </p>
        <h1 className="font-vogue mt-4 text-[clamp(2.5rem,11.6vw,11.5rem)] leading-[0.95] tracking-[-0.075em] sm:mt-7 sm:whitespace-nowrap">
          AURA &amp; AETHER
        </h1>
      </div>
    </section>
  );
}
