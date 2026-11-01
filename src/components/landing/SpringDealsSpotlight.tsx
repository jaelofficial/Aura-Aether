import Image from "next/image";
import Link from "next/link";
import { prisma, getProducts } from "@/lib/db";
import HomepageAddButton from "@/components/landing/HomepageAddButton";

const defaultFragrances = [
  { name: "Esencia de la Forêt", image: "/images/botanical-edit/esencia-foret.jpeg", alt: "Esencia de la Forêt botanical fragrance", imageKey: "homeBotanicalImage1" },
  { name: "Néctar de la Terre", image: "/images/botanical-edit/nectar-terre.jpeg", alt: "Néctar de la Terre earthy fragrance", imageKey: "homeBotanicalImage2" },
  { name: "Bleue Rivage", image: "/images/botanical-edit/bleue-rivage.jpeg", alt: "Bleue Rivage fresh aquatic fragrance", imageKey: "homeBotanicalImage3" },
  { name: "Rose L’Amour", image: "/images/collection/rose-lamour.jpeg", alt: "Rose L’Amour floral fragrance", imageKey: "homeCollectionImage2" },
];

export default async function SpringDealsSpotlight() {
  const imageKeys = defaultFragrances.map((fragrance) => fragrance.imageKey);
  const imageSettings = new Map<string, string>();
  let catalogProducts: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    const [rows, products] = await Promise.all([
      prisma.siteSetting.findMany({ where: { key: { in: imageKeys } }, select: { key: true, value: true } }),
      getProducts({ giftSets: false }),
    ]);
    for (const row of rows) imageSettings.set(row.key, row.value);
    catalogProducts = products;
  } catch (error) {
    console.error("Homepage botanical images could not be loaded:", error);
  }
  const normalizeName = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const fragrances = defaultFragrances.map((fragrance) => ({ ...fragrance, image: imageSettings.get(fragrance.imageKey) || fragrance.image, product: catalogProducts.find((item) => normalizeName(item.name) === normalizeName(fragrance.name)) }));

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
          <article key={fragrance.name} className="w-[82vw] max-w-[444px] shrink-0 snap-start">
            <Link href={fragrance.product ? `/shop/${fragrance.product.slug}` : "/shop"} className="block">
              <div className="relative aspect-square w-full overflow-hidden bg-[#f7f5f4]">
                <Image
                  src={fragrance.image}
                  alt={fragrance.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
            </Link>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col items-start gap-2">
                <h3 className="font-sans-clean text-lg font-medium leading-tight">{fragrance.name}</h3>
                <div className="flex" aria-hidden="true">
                  {[1, 2, 3, 4].map((star) => (
                    <Image key={star} src="/images/bestsellers/star-rate.svg" alt="" width={18} height={18} />
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <p className="font-sans-clean text-lg font-medium leading-[1.4] tracking-[0.1px] sm:text-xl">Eau de Parfum</p>
                <Link href={fragrance.product ? `/shop/${fragrance.product.slug}` : "/shop"} className="flex h-[50px] shrink-0 items-center justify-center rounded border border-black px-6 font-sans-clean text-sm transition-colors hover:bg-[#222a37] hover:text-white sm:px-8 sm:text-base">
                  Quick shop
                </Link>
              </div>
              {fragrance.product && <HomepageAddButton product={fragrance.product} />}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
