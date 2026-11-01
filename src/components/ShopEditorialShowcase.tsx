import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatGhs } from "@/lib/paystack";

const collectionSlots = [
  { name: "Forêt", key: "homeCollectionImage1", fallback: "/images/collection/forest-green.jpeg" },
  { name: "Rose L’Amour", key: "homeCollectionImage2", fallback: "/images/collection/rose-lamour.jpeg" },
  { name: "Noir Ambre", key: "homeCollectionImage3", fallback: "/images/collection/noir-ambre.jpeg" },
  { name: "Ambre Boisé", key: "homeCollectionImage4", fallback: "/images/collection/ambre-boise.jpeg" },
] as const;

const bestsellerSlots = [
  { name: "Forêt", key: "homeBestsellerImage1", fallback: "/images/bestsellers/foret.jpeg" },
  { name: "Ambre Boisé", key: "homeBestsellerImage2", fallback: "/images/bestsellers/ambre-boise.jpeg" },
  { name: "Noir Ambre", key: "homeBestsellerImage3", fallback: "/images/bestsellers/noir-ambre.jpeg" },
] as const;

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export default async function ShopEditorialShowcase() {
  let settings = new Map<string, string>();
  let products: Array<{ id: string; name: string; slug: string; price: number; originalPrice: number | null; isSale: boolean }> = [];

  try {
    const [rows, catalog] = await Promise.all([
      prisma.siteSetting.findMany({
        where: { key: { in: [...collectionSlots, ...bestsellerSlots].map((slot) => slot.key) } },
        select: { key: true, value: true },
      }),
      prisma.product.findMany({
        where: { isGiftSet: false },
        select: { id: true, name: true, slug: true, price: true, originalPrice: true, isSale: true },
      }),
    ]);
    settings = new Map(rows.map((row) => [row.key, row.value]));
    products = catalog;
  } catch (error) {
    console.error("Shop editorial images could not be loaded:", error);
  }

  const findProduct = (name: string) => {
    const target = normalize(name);
    return products.find((product) => normalize(product.name) === target)
      || products.find((product) => normalize(product.name).includes(target) || target.includes(normalize(product.name)));
  };

  const renderCards = (slots: readonly { name: string; key: string; fallback: string }[]) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {slots.map((slot) => {
        const product = findProduct(slot.name);
        const image = settings.get(slot.key) || slot.fallback;
        const discounted = !!product && product.originalPrice != null && product.originalPrice > product.price;
        const onSale = !!product && (product.isSale || discounted);
        return (
          <article key={slot.key} className="min-w-0">
            <Link href={product ? `/shop/${product.slug}` : "/shop"} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#F2F0ED]">
                <Image src={image} alt={slot.name + " fragrance"} fill sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 24vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                {onSale && <span className="absolute left-3 top-3 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#252522]">{discounted ? "On sale" : "On sale"}</span>}
              </div>
              <h3 className="mt-3 text-sm font-medium text-[#242421]">{slot.name}</h3>
              {product && <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-[#242421]">
                <span className="font-medium">{formatGhs(product.price)}</span>
                {discounted && <span className="text-[#83837C] line-through">{formatGhs(product.originalPrice!)}</span>}
              </div>}
            </Link>
          </article>
        );
      })}
    </div>
  );

  return (
    <section aria-label="Featured fragrance photography" className="mb-12 space-y-12">
      <div>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C827A]">Discover the range</p><h2 className="mt-2 font-serif-luxury text-2xl text-[#17110F] sm:text-3xl">Our Collection</h2></div>
        </div>
        {renderCards(collectionSlots)}
      </div>
      <div>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C827A]">Loved by our customers</p><h2 className="mt-2 font-serif-luxury text-2xl text-[#17110F] sm:text-3xl">Bestsellers</h2></div>
        </div>
        {renderCards(bestsellerSlots)}
      </div>
    </section>
  );
}
