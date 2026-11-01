import Image from "next/image";
import Link from "next/link";
import { prisma, getProducts } from "@/lib/db";
import HomepageAddButton from "@/components/landing/HomepageAddButton";

const defaultBestsellers = [
  {
    name: "Forêt",
    description: "A vivid green fragrance inspired by the stillness of the desert.",
    image: "/images/bestsellers/foret.jpeg",
    alt: "Green Forêt perfume bottle set against a desert landscape",
  },
  {
    name: "Ambre Boisé",
    description: "Warm amber and woods, captured in a softly golden scent.",
    image: "/images/bestsellers/ambre-boise.jpeg",
    alt: "Ambre Boisé perfume bottle resting on a woodland branch",
  },
  {
    name: "Noir Ambre",
    description: "A deep, magnetic amber fragrance with a sun-warmed finish.",
    image: "/images/bestsellers/noir-ambre.jpeg",
    alt: "Noir Ambre perfume bottle by the coast",
  },
];

export default async function Bestsellers() {
  const imageKeys = ["homeBestsellerImage1", "homeBestsellerImage2", "homeBestsellerImage3"] as const;
  const imageSettings = new Map<string, string>();
  let catalogProducts: Awaited<ReturnType<typeof getProducts>> = [];
  const saleNames = new Set<string>();
  try {
    const [rows, products] = await Promise.all([
      prisma.siteSetting.findMany({ where: { key: { in: [...imageKeys] } }, select: { key: true, value: true } }),
      getProducts({ giftSets: false }),
    ]);
    for (const row of rows) imageSettings.set(row.key, row.value);
    catalogProducts = products;
    for (const item of products) if (item.isSale || (item.originalPrice != null && item.originalPrice > item.price)) saleNames.add(item.name.toLowerCase());
  } catch (error) {
    console.error("Homepage bestseller images could not be loaded:", error);
  }
  const normalizeName = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const bestsellers = defaultBestsellers.map((product, index) => ({ ...product, image: imageSettings.get(imageKeys[index]) || product.image, catalogProduct: catalogProducts.find((item) => normalizeName(item.name) === normalizeName(product.name)) }));

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
            <Link href={product.catalogProduct ? `/shop/${product.catalogProduct.slug}` : "/shop"} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/10">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 30vw, 82vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {saleNames.has(product.name.toLowerCase()) && <span className="absolute left-3 top-3 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#252522]">On sale</span>}
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
            {product.catalogProduct && <HomepageAddButton product={product.catalogProduct} dark />}
          </article>
        ))}
      </div>
    </section>
  );
}
