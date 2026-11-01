import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

function getProductImage(product: Product) {
  return product.images?.find((url) => typeof url === "string" && url.trim() && !url.startsWith("/images/products/")) ||
    (product.image?.trim() && !product.image.startsWith("/images/products/") ? product.image : "");
}

export default function SpringDealsSpotlight({ products }: { products: Product[] }) {
  const fragrances = products.slice(0, 6);

  return (
    <section id="botanical-edit" className="bg-white px-6 py-20 text-black sm:px-10 sm:py-24 lg:px-[3.5vw] lg:py-28">
      <div className="mb-12 flex items-end justify-between gap-8 sm:mb-14">
        <div>
          <h2 className="font-sans-clean text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem]">
            Find your signature fragrance.
          </h2>
          <p className="mt-5 max-w-xl font-sans-clean text-sm leading-relaxed sm:text-base">
            Botanical compositions for the moments you want to make unforgettable.
          </p>
        </div>
        <Link href="/shop" className="shrink-0 font-sans-clean text-base font-medium underline underline-offset-4 sm:text-lg">
          Shop All
        </Link>
      </div>

      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {fragrances.map((fragrance) => (
          <article key={fragrance.id} className="w-[82vw] max-w-[444px] shrink-0 snap-start">
            <div className="relative aspect-square w-full overflow-hidden bg-[#f7f5f4]">
              {getProductImage(fragrance) ? <Image src={getProductImage(fragrance)} alt={fragrance.name} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-[#625A54]">Product image not added yet</div>}
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex flex-col items-start gap-2">
                <h3 className="font-sans-clean text-lg font-medium leading-tight">{fragrance.name}</h3>
                <div aria-hidden="true" className="text-sm tracking-[0.2em] text-[var(--accent-copper)]">✦ ✦ ✦ ✦</div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <p className="font-sans-clean text-lg font-medium leading-[1.4] tracking-[0.1px] sm:text-xl">Eau de Parfum</p>
                <Link href={`/shop/${fragrance.slug}`} className="flex h-[50px] shrink-0 items-center justify-center rounded border border-black px-6 font-sans-clean text-sm transition-colors hover:bg-[var(--primary)] hover:text-white sm:px-8 sm:text-base">
                  Quick shop
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
