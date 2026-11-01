import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

function getProductImage(product: Product) {
  return product.images?.find((url) => typeof url === "string" && url.trim() && !url.startsWith("/images/products/")) ||
    (product.image?.trim() && !product.image.startsWith("/images/products/") ? product.image : "");
}

export default function Bestsellers({ products }: { products: Product[] }) {
  const featured = products.filter((product) => product.isFeatured);
  const bestsellers = (featured.length ? featured : products).slice(0, 3);

  return (
    <section id="bestsellers" className="bg-[#222a37] px-6 py-20 text-white sm:px-10 sm:py-24 lg:px-[3.5vw] lg:py-28">
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

      <div className="mt-12 flex snap-x snap-mandatory items-end gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:snap-none lg:mt-16 lg:gap-8">
        {bestsellers.map((product, index) => (
          <article key={product.name} className="w-[82vw] max-w-[430px] shrink-0 snap-start sm:mx-auto sm:w-full sm:max-w-none">
            <Link href={`/shop/${product.slug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/10">
                {getProductImage(product) ? <Image src={getProductImage(product)} alt={product.name} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 30vw, 82vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-sm text-white/70">Product image not added yet</div>}
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-xs tracking-[0.12em]">0{index + 1}</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none">
                  <path d="M3 12h17m0 0-7-7m7 7-7 7" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium">{product.name}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">{product.description}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
