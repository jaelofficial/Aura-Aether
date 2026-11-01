"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const defaultSteps = [
  {
    title: "Find your fragrance.",
    description: "Explore the collection and choose the scent that feels like you.",
    image: "/images/how-to-order/step-01.jpeg",
    alt: "A fragrance specialist helping a customer explore scents, with a Step 01 card",
  },
  {
    title: "Make it yours.",
    description: "Select your preferred size and add your fragrance to the bag.",
    image: "/images/how-to-order/step-02.jpeg",
    alt: "A customer choosing a perfume to add to a gift bag, with a Step 02 card",
  },
  {
    title: "Place your order.",
    description: "Enter your delivery details and complete checkout securely.",
    image: "/images/how-to-order/step-03.jpeg",
    alt: "A customer completing a fragrance checkout on a phone, with a Step 03 card",
  },
  {
    title: "A little something arrives.",
    description: "We prepare your order with care and deliver it to your door.",
    image: "/images/how-to-order/step-04.jpeg",
    alt: "A fragrance order being delivered to a customer, with a Step 04 card",
  },
];

export default function HowToOrder() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState(defaultSteps);

  useEffect(() => {
    let active = true;
    fetch("/api/site-settings").then((response) => response.ok ? response.json() : null).then((data) => {
      if (!active) return;
      const settings = data?.settings || {};
      setSteps(defaultSteps.map((step, index) => {
        const savedImage = settings[`homeStepImage${index + 1}`];
        return { ...step, image: typeof savedImage === "string" && savedImage.trim() ? savedImage : step.image };
      }));
    }).catch(() => { if (active) setSteps(defaultSteps); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateActiveStep = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;

        const scrollableDistance = section.offsetHeight - window.innerHeight;
        if (scrollableDistance <= 0) return;

        const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / scrollableDistance));
        setActiveStep(Math.min(defaultSteps.length - 1, Math.floor(progress * defaultSteps.length)));
      });
    };

    updateActiveStep();
    window.addEventListener("scroll", updateActiveStep, { passive: true });
    window.addEventListener("resize", updateActiveStep);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveStep);
      window.removeEventListener("resize", updateActiveStep);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-to-order"
      aria-label="How to order"
      className="relative h-[400svh] bg-[#222a37] text-white"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-6 py-6 sm:px-10 sm:py-8 lg:px-[3.5vw] lg:py-20">
        <header className="mb-5 flex shrink-0 items-center justify-between gap-6 sm:mb-8">
          <h2 className="text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl lg:text-[4.5rem]">
            How to order.
          </h2>
          <span className="text-xs text-white/75 sm:text-sm">The process</span>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch lg:gap-14">
          <ol className="relative flex min-h-0 flex-col justify-between gap-2 py-1 sm:gap-3 lg:gap-0 lg:py-2">
            <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-white/25" />
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <li
                  key={step.title}
                  aria-current={isActive ? "step" : undefined}
                  className={`relative grid grid-cols-[34px_1fr] gap-3 pl-4 transition-opacity duration-500 sm:grid-cols-[56px_1fr] sm:gap-5 sm:pl-6 ${isActive ? "opacity-100" : "opacity-45"}`}
                >
                  <span aria-hidden="true" className={`absolute bottom-0 left-0 top-0 w-[2px] transition-colors duration-500 ${isActive ? "bg-white" : "bg-transparent"}`} />
                  <span className="pt-1 text-xs tabular-nums sm:pt-2 sm:text-sm">0{index + 1}</span>
                  <div>
                    <h3 className="text-lg leading-tight tracking-[-0.03em] sm:text-2xl lg:text-3xl">{step.title}</h3>
                    <p className="mt-1 max-w-[470px] text-xs leading-relaxed text-white/85 sm:mt-2 sm:text-sm lg:text-base">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="relative min-h-0 overflow-hidden bg-white/5">
            {steps.map((step, index) => (
              <Image
                key={step.image + index}
                src={step.image}
                alt={step.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 90vw"
                priority={index === 0}
                aria-hidden={index !== activeStep}
                className={`object-cover transition-opacity duration-700 ${index === activeStep ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex shrink-0 items-center gap-2" aria-label={`Step ${activeStep + 1} of ${steps.length}`}>
          {steps.map((step, index) => (
            <span key={step.title} className={`h-1 rounded-full transition-all duration-500 ${index === activeStep ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
          ))}
          <span className="ml-2 text-[10px] tabular-nums text-white/75">0{activeStep + 1} / 0{steps.length}</span>
        </div>
      </div>
    </section>
  );
}
