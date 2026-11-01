"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface ShopCategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  currentCategory: string;
  sort: string;
}

export default function ShopCategoryFilter({ categories, currentCategory, sort }: ShopCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = categories.find((category) => category.slug === currentCategory);
  const label = selectedCategory?.name ?? "All Fragrances";

  return (
    <div className="relative min-w-0 flex-1 sm:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-fragrance-categories"
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-12 w-full items-center justify-between gap-3 border border-[var(--primary)] bg-white px-4 text-left text-sm text-[var(--primary)]"
      >
        <span className="truncate">{label}</span>
        <Image src="/images/naya-icons/arrow-down.svg" alt="" width={20} height={20} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div id="mobile-fragrance-categories" className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden border border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg">
          <Link
            href={`/shop?sort=${sort}`}
            aria-current={!currentCategory ? "page" : undefined}
            onClick={() => setIsOpen(false)}
            className={`block border-b border-white/20 px-4 py-3.5 text-sm ${!currentCategory ? "bg-white/10" : "hover:bg-white/10"}`}
          >
            All Fragrances
          </Link>
          {categories.filter((category) => category.slug !== "gift-sets").map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}&sort=${sort}`}
              aria-current={currentCategory === category.slug ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={`block border-b border-white/20 px-4 py-3.5 text-sm last:border-b-0 ${currentCategory === category.slug ? "bg-white/10" : "hover:bg-white/10"}`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
