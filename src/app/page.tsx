import React from "react";
import HeroSection from "@/components/landing/HeroSection";
import OurCollection from "@/components/landing/OurCollection";
import SpringDealsSpotlight from "@/components/landing/SpringDealsSpotlight";
import Bestsellers from "@/components/landing/Bestsellers";
import HowToOrder from "@/components/landing/HowToOrder";
import NotesSection from "@/components/landing/NotesSection";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-[#FCFBF9]">
      {/* 1. Hero Section matching Reference 2 */}
      <HeroSection />

      <OurCollection />

      <Bestsellers />



      {/* 4. Spring Deals Spotlight matching Reference 1 */}
      <SpringDealsSpotlight />

      <HowToOrder />


      <NotesSection />

    </div>
  );
}
