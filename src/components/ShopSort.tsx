"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ShopSortProps {
  category?: string;
  search?: string;
  sort: string;
  className?: string;
}

const sortOptions = [
  { value: "newest", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

export default function ShopSort({ category, search, sort, className = "" }: ShopSortProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedSort = sortOptions.find((option) => option.value === sort) ?? sortOptions[0];

  function getSortHref(value: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("sort", value);
    return `/shop?${params.toString()}`;
  }

  return (
    <div className={`relative w-full min-w-0 flex-1 sm:w-auto sm:flex-none ${className}`}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="shop-sort-options"
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-12 w-full items-center justify-between gap-3 border border-[var(--primary)] bg-white px-4 text-left text-sm text-[var(--primary)] sm:w-auto sm:min-w-40"
      >
        <span className="truncate">{selectedSort.label}</span>
        <Image src="/images/naya-icons/arrow-down.svg" alt="" width={20} height={20} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div id="shop-sort-options" className="absolute right-0 top-full z-30 mt-2 min-w-full overflow-hidden border border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg sm:min-w-52">
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={getSortHref(option.value)}
              aria-current={sort === option.value ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={`block border-b border-white/20 px-4 py-3.5 text-sm last:border-b-0 ${sort === option.value ? "bg-white/10" : "hover:bg-white/10"}`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
