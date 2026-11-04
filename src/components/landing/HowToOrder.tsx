"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const defaultSteps = [
  {
    title: "Find your fragrance.",
    description: "Explore the collection and choose the scent that feels like you.",
    image: "/images/how-to-order/step-01.jpeg",
    alt: "A fragrance specialist helping a customer explore scents",
  },
  {
    title: "Make it yours.",
    description: "Select your preferred size and add your fragrance to the bag.",
    image: "/images/how-to-order/step-02.jpeg",
    alt: "A customer choosing a perfume to add to a gift bag",
  },
  {
    title: "Place your order.",
    description: "Enter your delivery details and complete checkout securely.",
    image: "/images/how-to-order/step-03.jpeg",
    alt: "A customer completing a fragrance checkout on a phone",
  },
  {
    title: "A little something arrives.",
    description: "We prepare your order with care and deliver it to your door.",
    image: "/images/how-to-order/step-04.jpeg",
    alt: "A fragrance order being delivered to a customer",
  },
];

export default function HowToOrder() {
  const [steps, setSteps] = useState(defaultSteps);

  useEffect(() => {
    let active = true;
    fetch("/api/site-settings")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active) return;
        const settings = data?.settings || {};
        setSteps(defaultSteps.map((step, index) => {
          const savedImage = settings[`homeStepImage${index + 1}`];
          return {
            ...step,
            image: typeof savedImage === "string" && savedImage.trim() ? savedImage : step.image,
          };
        }));
      })
      .catch(() => {
        if (active) setSteps(defaultSteps);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      id="how-to-order"
      aria-labelledby="how-to-order-title"
      className="bg-[#222a37] px-6 py-16 text-white sm:px-10 sm:py-20 lg:px-[3.5vw] lg:py-24"
    >
      <header className="mb-10 flex items-end justify-between gap-6 sm:mb-14">
        <h2 id="how-to-order-title" className="text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl lg:text-[4.5rem]">
          How to order.
        </h2>
        <span className="pb-1 text-xs text-white/75 sm:text-sm">The process</span>
      </header>

      <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {steps.map((step, index) => (
          <li key={step.title} className="min-w-0">
            <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-white/5">
              <Image
                src={step.image}
                alt={step.alt}
                fill
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                priority={index === 0}
                className="object-cover"
              />
              <span className="absolute left-4 top-4 text-sm tabular-nums text-white drop-shadow">0{index + 1}</span>
            </div>
            <h3 className="text-xl leading-tight tracking-[-0.03em] sm:text-2xl">{step.title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80 sm:text-base">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
