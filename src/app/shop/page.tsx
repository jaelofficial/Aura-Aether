import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ShopSort from "@/components/ShopSort";
import ShopCategoryFilter from "@/components/ShopCategoryFilter";
import { getProducts, getCategories } from "@/lib/db";


export const dynamic = "force-dynamic";
interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: "price-asc" | "price-desc" | "newest" | "name";
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const currentCategory = params.category || "";
  const currentSort = params.sort || "newest";
  const searchQuery = params.search || "";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      category: currentCategory || undefined,
      sort: currentSort,
      search: searchQuery || undefined,
      giftSets: false,
    }),
  ]);

  return (
    <div className="bg-white pb-8 pt-28 sm:pb-10 sm:pt-32 lg:pt-36">
      <div className="px-4 sm:px-6 lg:px-[4vw]">
        <div className="mb-7 flex flex-row items-center justify-between gap-3 border-b border-[#D9D9D1] pb-5 sm:gap-5">
          <ShopCategoryFilter categories={categories} currentCategory={currentCategory} sort={currentSort} />
          <nav aria-label="Fragrance categories" className="hidden flex-wrap items-center gap-x-7 gap-y-3 sm:flex">
            <Link
              href={`/shop?sort=${currentSort}`}
              aria-current={!currentCategory ? "page" : undefined}
              className={`text-xs transition-colors ${!currentCategory ? "font-semibold text-[var(--primary)]" : "text-[#252522] hover:text-[var(--primary)]"}`}
            >
              All Fragrances
            </Link>
            {categories
              .filter((category) => category.slug !== "gift-sets")
              .map((category) => {
                const isSelected = currentCategory === category.slug;
                return (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}&sort=${currentSort}`}
                    aria-current={isSelected ? "page" : undefined}
                    className={`text-xs transition-colors ${isSelected ? "font-semibold text-[var(--primary)]" : "text-[#252522] hover:text-[var(--primary)]"}`}
                  >
                    {category.name}
                  </Link>
                );
              })}
          </nav>

          <ShopSort category={currentCategory} search={searchQuery} sort={currentSort} />
        </div>

        {/* Results Counter */}
        <div className="mb-5 flex justify-between items-center text-xs text-[#77776F]">
          <p>
            <strong className="text-[#252522]">{products.length}</strong> fragrances
            {searchQuery && ` for "${searchQuery}"`}
          </p>
          <Link href="/gift-sets" className="text-[#5B514F] hover:text-[var(--primary)] hover:underline">
            Gift sets →
          </Link>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white/60 p-8">
            <h3 className="font-serif-luxury text-2xl font-normal text-[#1C1917] mb-2">
              No fragrances found
            </h3>
            <p className="text-sm text-[#78716C] max-w-sm mx-auto mb-6">
              We couldn&apos;t find any perfumes matching this filter. Try clearing filters or exploring our other collections.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-[var(--primary)] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#773B44]"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
