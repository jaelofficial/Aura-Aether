"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { formatGhs } from "@/lib/paystack";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.products || []);
          }
        } catch {
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Fragrances"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-20 backdrop-blur-sm transition-opacity"
    >
      <div className="w-full max-w-2xl animate-fade-in overflow-hidden border border-black/10 bg-white shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-black/10 bg-white px-6 py-4">
          <Search className="mr-3 h-5 w-5 text-[var(--primary)]" />
          <input
            type="text"
            placeholder="Search by perfume name, accord, or notes (e.g. Amber, Rose, Oud)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full border-none bg-transparent text-base text-black placeholder:text-black/35 focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1 text-black/45 transition-colors hover:text-[var(--primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] divide-y divide-black/10 overflow-y-auto bg-white p-4">
          {isLoading && (
            <p className="py-8 text-center text-sm text-black/55">Searching perfumes...</p>
          )}

          {!isLoading && query.trim().length > 1 && results.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-black">No fragrances found for &quot;{query}&quot;</p>
              <p className="mt-1 text-xs text-black/55">Try searching for &quot;Oud&quot;, &quot;Floral&quot;, or &quot;Meadow&quot;</p>
            </div>
          )}

          {!isLoading &&
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  router.push(`/shop/${product.slug}`);
                  onClose();
                }}
                className="group flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-[var(--primary)]/[0.06]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-[var(--primary)]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif-luxury text-base font-semibold text-[var(--primary)] transition-colors group-hover:text-[#773B44]">
                      {product.name}
                    </h4>
                    <p className="text-[11px] uppercase tracking-wider text-black/50">
                      {product.scentNotes} • {product.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-black">
                    {formatGhs(product.price)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--primary)] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}

          {!query && (
            <div className="py-6 px-4 text-center">
              <p className="mb-3 text-xs uppercase tracking-widest text-[var(--primary)]">
                Popular Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Meadow", "Velvet Oud", "Jardinea", "Amber Bloom", "Gift Sets"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="border border-black/15 bg-white px-3 py-1.5 text-xs text-black/70 transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
