"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingCart, Check, Zap } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product.inStock || product.stock <= 0) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product.inStock || product.stock <= 0) return;
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      {/* Availability Status */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            product.inStock && product.stock > 0 ? "bg-[#10B981]" : "bg-[#EF4444]"
          }`}
        />
        <span className="text-xs font-medium text-[#4A443F]">
          {product.inStock && product.stock > 0
            ? `In Stock (${product.stock} available in current batch)`
            : "Currently Sold Out"}
        </span>
      </div>

      {/* Quantity & Add to Cart Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center justify-between border border-[#D5CDC4] rounded-full px-4 py-2.5 bg-white sm:w-36">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || !product.inStock}
            className="p-1 text-[#5C554F] hover:text-[#1C1917] disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-semibold text-sm text-[#1C1917]">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock || !product.inStock}
            className="p-1 text-[#5C554F] hover:text-[#1C1917] disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add To Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.inStock || product.stock <= 0}
          className={`aa-button flex-1 py-4 px-8 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${
            !product.inStock
              ? "bg-[#E5DDD4] text-[#A89F95] cursor-not-allowed"
              : added
              ? "bg-[#4B5945] text-white"
              : "bg-[#1C1917] text-[#FAF8F5] hover:bg-[#38332E]"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* Quick Buy Now Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!product.inStock || product.stock <= 0}
          className="py-4 px-6 rounded-full border border-[#1C1917] text-xs font-bold uppercase tracking-widest text-[#1C1917] hover:bg-[#FAF5EE] transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Zap className="w-4 h-4 text-[#C59B4B]" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
