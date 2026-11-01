import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";

const notes = [
  {
    number: "01",
    title: "Long-lasting Presence",
    description: "Built with a high fragrance concentration for a scent trail that stays with you.",
    orderClass: "order-2",
    className: "lg:col-start-1 lg:row-start-2",
  },
  {
    number: "03",
    title: "Signature Character",
    description: "Not made to blend in. Each composition is crafted with a distinct personality.",
    orderClass: "order-4",
    className: "lg:col-start-2 lg:row-start-2",
  },
  {
    number: "04",
    title: "Luxury in Every Detail",
    description: "From formulation to bottle design, every element is made to feel elevated and timeless.",
    orderClass: "order-5",
    className: "lg:col-start-3 lg:row-start-2",
  },
];

function getProductImage(product: Product) {
  return product.images?.find((url) => typeof url === "string" && url.trim() && !url.startsWith("/images/products/")) ||
    (product.image?.trim() && !product.image.startsWith("/images/products/") ? product.image : "");
}

type CollectionNoteProps = {
  number: string;
  title: string;
  description: string;
  className?: string;
};

function CollectionNote({
  number,
  title,
  description,
  className = "",
}: CollectionNoteProps) {
  return (
    <article className={`flex min-h-36 flex-col justify-center ${className}`}>
      <div className="mb-4 flex items-center justify-between text-lg text-[#17110F]">
        <span>{number}</span>
        <ArrowRight aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-medium text-[#17110F]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#625A54]">{description}</p>
    </article>
  );
}

export default function OurCollection({ products }: { products: Product[] }) {
  const collectionImages = products.slice(0, 4).map((product) => ({
    src: getProductImage(product),
    alt: `${product.name} fragrance`,
    slug: product.slug,
  }));

  return (
    <section aria-labelledby="collection-title" className="bg-white px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-[4vw] lg:pb-28 lg:pt-[6.8vw]">
      <div className="mx-auto grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-[8.5vw] lg:gap-y-0">
        {collectionImages.slice(0, 2).map((image, index) => image.src ? (
          <Image key={image.slug} src={image.src} alt={image.alt} width={1361} height={1824} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw" className={`hidden aspect-square w-full object-cover ${index === 0 ? "order-2" : "order-3"} sm:block sm:order-none`} />
        ) : <div key={image.slug} className="hidden aspect-square w-full bg-[#F1EAE4] sm:block" />)}

        <div className="order-first flex flex-col items-center text-center sm:col-span-2 lg:order-none lg:col-span-1 lg:items-end lg:pt-0 lg:text-right">
          <span className="mb-5 inline-flex items-center rounded-full border border-[#D8D4CE] px-4 py-2 text-sm text-[#201A17]">
            Extrait de Parfum <span className="ml-2 text-xs" aria-hidden="true">✦</span>
          </span>
          <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8C827A]">Our Collection</span>
          <h2 id="collection-title" className="font-serif-luxury max-w-sm text-3xl leading-[1.12] text-[#17110F] sm:text-4xl">
            Each Aura &amp; Aether fragrance leaves a lasting trace.
          </h2>
        </div>

        {notes.map((note) => (
          <CollectionNote
            key={note.number}
            number={note.number}
            title={note.title}
            description={note.description}
            className={`${note.orderClass} sm:order-none lg:pt-[5.8vw] ${note.className}`}
          />
        ))}

        <CollectionNote
          number="02"
          title="Layered Complexity"
          description="Every scent unfolds in phases—from bright opening notes to an intimate dry-down."
          className="order-3 sm:order-none lg:col-start-1 lg:row-start-3 lg:mt-[2.5vw] lg:pt-[15vw]"
        />

        {collectionImages.slice(2).map((image) => image.src ? (
          <Image key={image.slug} src={image.src} alt={image.alt} width={1361} height={1824} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw" className="hidden aspect-square w-full order-8 object-cover sm:block sm:order-none lg:mt-[2.5vw]" />
        ) : <div key={image.slug} className="hidden aspect-square w-full bg-[#F1EAE4] sm:block" />)}
      </div>
    </section>
  );
}
