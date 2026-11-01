import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/db";

export default async function Bestsellers() {
  const products = (await getProducts({
    giftSets: false,
    sort: "newest",
  })).slice(0, 5);

  return (
    <section
      id="bestsellers"
      className="bg-[#222a37] px-6 py-20 text-white sm:px-10 sm:py-24 lg:px-[3.5vw] lg:py-28"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8 lg:max-w-[1147px]">
          <h2 className="text-3xl font-medium leading-tight sm:w-[500px] sm:shrink-0 sm:text-4xl lg:text-[2.5rem]">
            The fragrances everyone remembers.
          </h2>
          <p className="max-w-[500px] text-sm leading-relaxed sm:text-base">
            Discover the signature scents our community returns to, each composed to leave a lasting impression.
          </p>
        </div>
        <Link href="/shop" className="flex shrink-0 items-center gap-5 self-start text-base font-medium underline underline-offset-4 sm:text-lg lg:flex-col lg:items-end lg:gap-6">
          Shop all fragrances
          <svg aria-hidden="true" viewBox="0 0 56 24" className="h-6 w-14" fill="none">
            <path d="M1 12h52m0 0L42 2m11 10L42 22" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/75">
          Our fragrance collection is being updated. Please check back soon.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:mt-16 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
