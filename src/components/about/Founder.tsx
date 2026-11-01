"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const founderImages = [
  { key: "aboutFounderImage1", alt: "Founder story photograph", position: "lg:left-[3%] lg:top-[12%] lg:rotate-[-4deg]" },
  { key: "aboutFounderImage2", alt: "Founder experience photograph", position: "lg:left-[52%] lg:top-[11%] lg:rotate-[3deg]" },
  { key: "aboutFounderImage3", alt: "Founder process photograph", position: "lg:left-[27%] lg:top-[48%] lg:rotate-[-3deg]" },
  { key: "aboutFounderImage4", alt: "Founder fragrance photograph", position: "lg:left-[76%] lg:top-[45%] lg:rotate-[4deg]" },
];

export default function Founder() {
  const [images, setImages] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch("/api/site-settings").then((res) => res.ok ? res.json() : null).then((data) => {
      const settings = data?.settings || {};
      setImages(Object.fromEntries(founderImages.map((image) => [image.key, settings[image.key] || ""])));
    }).catch(() => setImages({}));
  }, []);

  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[var(--primary)] px-5 py-16 text-white sm:px-8 lg:h-[100svh] lg:px-[4vw] lg:py-0">
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:radial-gradient(#fff_0.6px,transparent_0.6px)] [background-size:7px_7px]" />

      <div className="relative mx-auto grid max-w-4xl grid-cols-1 gap-y-8 lg:absolute lg:inset-0 lg:block lg:max-w-none">
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
