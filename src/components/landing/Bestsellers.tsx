import Image from "next/image";
import Link from "next/link";
import { prisma, getProducts } from "@/lib/db";

const defaultBestsellers = [
  {
    name: "Forêt",
    description: "A vivid green fragrance inspired by the stillness of the desert.",
    image: "/images/bestsellers/foret.jpeg",
    alt: "Green Forêt perfume bottle set against a desert landscape",
    imageKey: "homeBestsellerImage1",
  },
  {
    name: "Ambre Boisé",
    description: "Warm amber and woods, captured in a softly golden scent.",
    image: "/images/bestsellers/ambre-boise.jpeg",
    alt: "Ambre Boisé perfume bottle resting on a woodland branch",
    imageKey: "homeBestsellerImage2",
  },
  {
    name: "Noir Ambre",
    description: "A deep, magnetic amber fragrance with a sun-warmed finish.",
    image: "/images/bestsellers/noir-ambre.jpeg",
    alt: "Noir Ambre perfume bottle by the coast",
    imageKey: "homeBestsellerImage3",
  },
];

export default async function Bestsellers() {
  const imageKeys = defaultBestsellers.map((product) => product.imageKey);
  const imageSettings = new Map<string, string>();
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    const [rows, catalog] = await Promise.all([
      prisma.siteSetting.findMany({ where: { key: { in: imageKeys } }, select: { key: true, value: true } }),
      getProducts({ giftSets: false }),
    ]);
    for (const row of rows) imageSettings.set(row.key, row.value);
    products = catalog;
  } catch (error) {
    console.error("Homepage bestseller content could not be loaded:", error);
  }

  const normalizeName = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const bestsellers = defaultBestsellers.map((item) => ({
    ...item,
    image: imageSettings.get(item.imageKey) || item.image,
    product: products.find((product) => normalizeName(product.name) === normalizeName(item.name)),
  }));

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

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:mt-16">
        {bestsellers.map((product, index) => (
          <article key={product.name} className="w-full min-w-0">
            <Link href={product.product ? `/shop/${product.product.slug}` : "/shop"} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/10">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes="(min-width: 640px) 30vw, 90vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 sm:mt-6">
                <span className="text-[10px] tracking-[0.12em] sm:text-xs">0{index + 1}</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-1 sm:h-6 sm:w-6" fill="none">
                  <path d="M3 12h17m0 0-7-7m7 7-7 7" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-medium sm:mt-4 sm:text-xl">{product.name}</h3>
              <p className="mt-2 hidden max-w-sm text-sm leading-relaxed text-white/85 sm:block">{product.description}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
