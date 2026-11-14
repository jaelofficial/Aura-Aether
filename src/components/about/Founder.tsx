"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getClientSiteSettings } from "@/lib/site-settings-client";

const founderImages = [
  { key: "aboutFounderImage1", alt: "Founder story photograph", position: "lg:left-[3%] lg:top-[12%] lg:rotate-[-4deg]" },
  { key: "aboutFounderImage2", alt: "Founder experience photograph", position: "lg:left-[52%] lg:top-[11%] lg:rotate-[3deg]" },
  { key: "aboutFounderImage3", alt: "Founder process photograph", position: "lg:left-[27%] lg:top-[48%] lg:rotate-[-3deg]" },
  { key: "aboutFounderImage4", alt: "Founder fragrance photograph", position: "lg:left-[76%] lg:top-[45%] lg:rotate-[4deg]" },
];

const fallbackStory = "Aura & Aether was created for the moments, moods, and memories that make you who you are.";

export default function Founder() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("A fragrance house with a story");
  const [story, setStory] = useState(fallbackStory);

  useEffect(() => {
    getClientSiteSettings().then((settings) => {
      setImages(Object.fromEntries(founderImages.map((image) => [image.key, settings[image.key] || ""])));
      if (settings.aboutFounderTitle) setTitle(settings.aboutFounderTitle);
      if (settings.aboutFounderText) setStory(settings.aboutFounderText);
    });
  }, []);

  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[var(--primary)] px-5 py-16 text-white sm:px-8 lg:h-[100svh] lg:px-[4vw] lg:py-0">
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:radial-gradient(#fff_0.6px,transparent_0.6px)] [background-size:7px_7px]" />

      <div className="relative z-10 mx-auto mb-10 max-w-xl text-center lg:absolute lg:left-1/2 lg:top-1/2 lg:mb-0 lg:w-[min(36vw,520px)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-sm lg:bg-[var(--primary)]/90 lg:px-8 lg:py-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/65">Our founder</p>
        <h2 className="mt-3 font-serif-luxury text-3xl leading-tight sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/85 sm:text-base">{story}</p>
      </div>

      <div className="relative mx-auto grid max-w-4xl grid-cols-2 gap-4 lg:absolute lg:inset-0 lg:block lg:max-w-none">
        {founderImages.map((image, index) => images[image.key] ? (
          <figure
            key={image.key}
            className={`relative mx-auto w-full max-w-[420px] overflow-hidden border-[5px] border-[#f7f1e8] bg-[#f7f1e8] shadow-[0_18px_45px_rgba(35,13,16,0.3)] lg:absolute lg:w-[21vw] lg:max-w-[380px] lg:border-[7px] ${image.position}`}
            style={{ zIndex: index + 1 }}
          >
            <Image
              src={images[image.key]}
              alt={image.alt}
              width={1408}
              height={1746}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 21vw"
              className="h-auto w-full"
            />
          </figure>
        ) : null)}
      </div>
    </section>
  );
}
