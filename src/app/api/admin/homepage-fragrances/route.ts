import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

const fragrances = [
  { name: "Forêt", slug: "foret", price: 450, stock: 20, category: { id: "cat-fresh", name: "Fresh & Citrus", slug: "fresh", description: "Crisp neroli, sparkling bergamot, morning rain, and breezy botanicals." }, scentNotes: "FRESH & GREEN", description: "A vivid green fragrance inspired by the stillness of nature.", imageKey: "homeCollectionImage1", bestsellerKey: "homeBestsellerImage1", fallback: "/images/collection/forest-green.jpeg" },
  { name: "Rose L’Amour", slug: "rose-lamour", price: 420, stock: 15, category: { id: "cat-floral", name: "Floral", slug: "floral", description: "Lush botanicals, delicate rose, jasmine sambac, and morning blossoms." }, scentNotes: "FLORAL & ROMANTIC", description: "A graceful floral fragrance with a soft, romantic character.", imageKey: "homeCollectionImage2", fallback: "/images/collection/rose-lamour.jpeg" },
  { name: "Noir Ambre", slug: "noir-ambre", price: 480, stock: 18, category: { id: "cat-amber", name: "Amber & Spice", slug: "amber-spice", description: "Warm golden resin, cardamom, Madagascar vanilla, and exotic amber." }, scentNotes: "WARM AMBER & SPICE", description: "A deep, magnetic amber fragrance with a warm, lasting finish.", imageKey: "homeCollectionImage3", bestsellerKey: "homeBestsellerImage3", fallback: "/images/collection/noir-ambre.jpeg" },
  { name: "Ambre Boisé", slug: "ambre-boise", price: 460, stock: 12, category: { id: "cat-woody", name: "Woody & Earthy", slug: "woody", description: "Deep cedar, smoky sandalwood, vetiver, and sacred oud accords." }, scentNotes: "WOODY & AMBER", description: "A warm composition of amber and woods with a refined finish.", imageKey: "homeCollectionImage4", bestsellerKey: "homeBestsellerImage2", fallback: "/images/collection/ambre-boise.jpeg" },
];

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aura_admin_token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const createdOrUpdated: string[] = [];
    for (const item of fragrances) {
      const category = await prisma.category.upsert({
        where: { slug: item.category.slug },
        update: { name: item.category.name, description: item.category.description },
        create: item.category,
      });
      const setting = await prisma.siteSetting.findUnique({ where: { key: item.imageKey }, select: { value: true } });
      const image = setting?.value || item.fallback;
      const bestsellerImage = "bestsellerKey" in item && item.bestsellerKey ? (await prisma.siteSetting.findUnique({ where: { key: item.bestsellerKey }, select: { value: true } }))?.value : undefined;
      const productImages = [...new Set([image, bestsellerImage].filter((value): value is string => Boolean(value)))];
      const existing = await prisma.product.findFirst({
        where: { name: { equals: item.name, mode: "insensitive" }, isGiftSet: false },
        select: { id: true },
      });
      const data = {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        size: "100ml",
        stock: item.stock,
        inStock: true,
        isFeatured: true,
        isGiftSet: false,
        isSale: false,
        scentNotes: item.scentNotes,
        image,
        images: productImages,
        categoryId: category.id,
      };
      if (existing) {
        await prisma.product.update({ where: { id: existing.id }, data });
        createdOrUpdated.push(item.name);
      } else {
        let slug = item.slug;
        let suffix = 2;
        while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) slug = item.slug + "-" + suffix++;
        await prisma.product.create({ data: { ...data, slug } });
        createdOrUpdated.push(item.name);
      }
    }
    return NextResponse.json({ success: true, fragrances: createdOrUpdated });
  } catch (error) {
    console.error("Homepage fragrance setup failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not prepare homepage fragrances" }, { status: 500 });
  }
}
