import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts, prisma } from "@/lib/db";
import { Gift, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Artisanal Gift Sets & Coffrets | Aura & Aether Parfums",
  description:
    "Explore luxury presentation coffrets, travel atomizers, and curated fragrance sets from Aura & Aether Parfums.",
};

export default async function GiftSetsPage() {
  const [giftSets, settingsRows] = await Promise.all([
    getProducts({ giftSets: true }),
    prisma.siteSetting.findMany().catch(() => []),
  ]);
  const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value])) as Record<string, string>;

  return (
    <div className="bg-white pb-12 pt-28 sm:pb-16 sm:pt-32 lg:pt-36">
      <div className="px-4 sm:px-6 lg:px-[4vw]">
        <header className="mb-10 flex flex-col gap-5 border-b border-black/10 pb-8 sm:mb-12 sm:pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
              <Gift className="h-3.5 w-3.5" />
              {settings.giftSetsEyebrow || "Gifts, thoughtfully composed"}
            </p>
            <h1 className="font-serif-luxury text-4xl font-normal leading-tight text-[var(--primary)] sm:text-5xl lg:text-6xl">
              {settings.giftSetsTitle || "A gift that lingers."}
            </h1>
          </div>
          <div className="max-w-md lg:pb-1">
            <p className="text-sm leading-6 text-black sm:text-base sm:leading-7">
              {settings.giftSetsDescription || "Discover considered fragrance gifts for celebrations, everyday moments, and the people you love."}
            </p>
            <Link href="/shop" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[var(--primary)] transition-colors hover:text-[#773B44]">
              Explore all fragrances <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <div className="mb-5 flex items-center justify-between text-xs text-black/60">
          <p><span className="font-medium text-black">{giftSets.length}</span> curated gifts</p>
          <span className="hidden uppercase tracking-[0.14em] sm:inline">Made to be remembered</span>
        </div>

        {giftSets.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            {giftSets.map((set) => <ProductCard key={set.id} product={set} />)}
          </div>
        ) : (
          <div className="border-y border-black/10 py-16 text-center sm:py-20">
            <h2 className="font-serif-luxury text-2xl text-[var(--primary)]">A considered gift is on its way.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/65">
              Our curated coffrets are being prepared. In the meantime, explore the fragrances that make each gift personal.
            </p>
            <Link href="/shop" className="mt-6 inline-flex items-center gap-2 bg-[var(--primary)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#773B44]">
              Shop fragrances <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <section aria-label="Gift service details" className="mt-16 bg-[var(--primary)] px-5 py-8 text-white sm:mt-20 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid grid-cols-1 divide-y divide-white/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <article className="py-5 first:pt-0 sm:px-5 sm:py-2 sm:first:pl-0 sm:first:pt-2">
              <Sparkles className="mb-4 h-5 w-5 text-white/80" strokeWidth={1.5} />
              <h2 className="font-serif-luxury text-lg">Wrapped with care</h2>
              <p className="mt-2 max-w-xs text-xs leading-5 text-white/80">Every coffret arrives with a silk ribbon and a handwritten note.</p>
            </article>
            <article className="py-5 sm:px-5 sm:py-2">
              <Gift className="mb-4 h-5 w-5 text-white/80" strokeWidth={1.5} />
              <h2 className="font-serif-luxury text-lg">Made for discovery</h2>
              <p className="mt-2 max-w-xs text-xs leading-5 text-white/80">Thoughtful fragrance pairings make it easy to find a new favorite.</p>
            </article>
            <article className="py-5 last:pb-0 sm:py-2 sm:pl-5 sm:last:pr-0 sm:last:pb-2">
              <ShieldCheck className="mb-4 h-5 w-5 text-white/80" strokeWidth={1.5} />
              <h2 className="font-serif-luxury text-lg">Delivered with care</h2>
              <p className="mt-2 max-w-xs text-xs leading-5 text-white/80">Protective packaging helps your gift arrive ready to give.</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
