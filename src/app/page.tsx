import React from "react";
import HeroSection from "@/components/landing/HeroSection";
import OurCollection from "@/components/landing/OurCollection";
import SpringDealsSpotlight from "@/components/landing/SpringDealsSpotlight";
import Bestsellers from "@/components/landing/Bestsellers";
import HowToOrder from "@/components/landing/HowToOrder";
import NotesSection from "@/components/landing/NotesSection";
import { getProducts } from "@/lib/db";
import type { Product } from "@/types";

export default async function HomePage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch (error) {
    console.error("Homepage products could not be loaded:", error);
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9]">
      {/* 1. Hero Section matching Reference 2 */}
      <HeroSection />

      <OurCollection products={products} />

      <Bestsellers products={products} />



      {/* 4. Spring Deals Spotlight matching Reference 1 */}
      <SpringDealsSpotlight products={products} />

      <HowToOrder />


      <NotesSection />

    </div>
  );
}
