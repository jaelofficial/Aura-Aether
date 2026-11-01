import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

export default function Bestsellers({ products }: { products: Product[] }) {
  const fragrances = products.filter((product) => !product.isGiftSet);

  return (
    <section
      id="bestsellers"
      className="bg-[#222a37] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-[4vw] lg:py-24"
    >
      <div className="mb-9 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/65">
            Aura &amp; Aether Parfums
          </p>
          <h2 className="text-3xl font-medium leading-tight sm:text-4xl lg:text-[2.5rem]">
            The fragrances everyone remembers.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Explore our fragrance collection and find the scent that becomes part of your signature.
          </p>
        </div>
        <Link
          href="/shop"
          className="flex shrink-0 items-center gap-3 self-start text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-75 sm:self-auto"
        >
          View all fragrances
          <svg aria-hidden="true" viewBox="0 0 56 24" className="h-6 w-14" fill="none">
            <path d="M1 12h52m0 0L42 2m11 10L42 22" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </Link>
      </div>

      {fragrances.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/75">
          Our fragrance collection is being updated. Please check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-6 lg:gap-x-5 lg:gap-y-10">
          {fragrances.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
