"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Product } from "@/types";

export default function ProductImageGallery({ product }: { product: Product }) {
  const images = useMemo(
    () => [...new Set([...(product.images || []), product.image].filter((url): url is string => typeof url === "string" && url.trim().length > 0 && !url.startsWith("/images/products/")))],
    [product.image, product.images]
  );
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  return (
    <div className="space-y-3">
      <div className="relative aspect-4/5 w-full bg-white rounded-3xl border border-[#ECE5DD] overflow-hidden p-8 shadow-sm flex items-center justify-center">
        {selectedImage ? (
          <Image
            key={selectedImage}
            src={selectedImage}
            alt={product.name}
            fill
            priority
            className="object-contain p-8 hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <span className="text-sm text-[#8C827A]">No product photos added yet</span>
        )}
        {product.originalPrice != null && product.originalPrice > product.price ? (
          <span className="absolute top-6 left-6 bg-[#9B2C2C] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </span>
        ) : product.isSale ? (
          <span className="absolute top-6 left-6 bg-[#DFC07D] text-[#1C1917] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
            SPECIAL OFFER
          </span>
        ) : null}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3" aria-label="More product photos">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedImage(url)}
              aria-label={`View product photo ${index + 1}`}
              aria-pressed={selectedImage === url}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-white p-1 transition-colors ${selectedImage === url ? "border-[#9B7036] ring-1 ring-[#9B7036]" : "border-[#ECE5DD] hover:border-[#C9BBA9]"}`}
            >
              <Image src={url} alt={`${product.name} photo ${index + 1}`} fill className="object-contain p-1" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
