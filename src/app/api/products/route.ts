import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getProducts, createProduct, updateProduct, deleteProduct, prisma } from "@/lib/db";
import { initialCategories } from "@/lib/data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const giftSets =
      searchParams.get("giftSets") === "true"
        ? true
        : searchParams.get("giftSets") === "false"
        ? false
        : undefined;
    const search = searchParams.get("search") || undefined;
    const sort = (searchParams.get("sort") as "price-asc" | "price-desc" | "newest" | "name") || undefined;

    const products = await getProducts({ category, featured, giftSets, search, sort });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aura_admin_token")?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name?.trim() || body.price === undefined || body.price === "" || !body.description?.trim() || !body.size?.trim()) {
      return NextResponse.json({ error: "Name, price, size, and description are required" }, { status: 400 });
    }

    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Enter a valid price greater than zero" }, { status: 400 });
    }

    const originalPrice = body.originalPrice === undefined || body.originalPrice === null || String(body.originalPrice).trim() === ""
      ? null
      : Number(body.originalPrice);
    if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice <= price)) {
      return NextResponse.json({ error: "Original price must be greater than the current selling price" }, { status: 400 });
    }

    // The demo category IDs may not exist in a newly configured production database.
    // Resolve the category against PostgreSQL and create the matching default category if missing.
    const requestedCategoryId = body.categoryId || "cat-fresh";
    const categoryTemplate =
      initialCategories.find((category) =>
        category.id === requestedCategoryId || category.slug === requestedCategoryId
      ) || initialCategories.find((category) => category.id === "cat-fresh")!;

    let category = await prisma.category.findUnique({ where: { id: requestedCategoryId } });
    if (!category) {
      category = await prisma.category.upsert({
        where: { slug: categoryTemplate.slug },
        update: {},
        create: {
          id: categoryTemplate.id,
          name: categoryTemplate.name,
          slug: categoryTemplate.slug,
          description: categoryTemplate.description,
        },
      });
    }

    const baseSlug = (typeof body.slug === "string" && body.slug.trim()
      ? body.slug
      : body.name
    ).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    if (!baseSlug) {
      return NextResponse.json({ error: "Enter a valid product name" }, { status: 400 });
    }

    // Keep product slugs unique when a product with the same name already exists.
    let slug = baseSlug;
    let suffix = 2;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const stock = Number.parseInt(String(body.stock ?? "10"), 10);
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock must be a whole number of zero or more" }, { status: 400 });
    }

    const newProduct = await createProduct({
      ...body,
      name: body.name.trim(),
      slug,
      price,
      originalPrice,
      stock,
      inStock: stock > 0,
      image: (Array.isArray(body.images) ? body.images.find((url: unknown) => typeof url === "string" && url.trim().length > 0) : undefined) || body.image || "",
      images: Array.isArray(body.images) ? body.images.filter((url: unknown): url is string => typeof url === "string" && url.trim().length > 0) : [],
      categoryId: category.id,
      size: body.size.trim(),
      scentNotes: body.scentNotes || "ARTISANAL ACCORD",
      isFeatured: !!body.isFeatured,
      isGiftSet: !!body.isGiftSet,
      isSale: !!body.isSale,
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aura_admin_token")?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const body = await req.json();

    if (body.action === "bulk-discount" || body.action === "remove-bulk-discount") {
      const productIds = Array.isArray(body.productIds)
        ? [...new Set(body.productIds.filter((id: unknown) => typeof id === "string" && id.trim()))]
        : [];
      if (productIds.length === 0) {
        return NextResponse.json({ error: "Select at least one product" }, { status: 400 });
      }
      if (body.action === "bulk-discount") {
        const percent = Number(body.percent);
        if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
          return NextResponse.json({ error: "Discount must be greater than 0% and less than 100%" }, { status: 400 });
        }
      }

      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, originalPrice: true },
      });
      if (existingProducts.length !== productIds.length) {
        return NextResponse.json({ error: "One or more selected products could not be found" }, { status: 404 });
      }

      await prisma.$transaction(existingProducts.map((product) => {
        if (body.action === "remove-bulk-discount") {
          return prisma.product.update({
            where: { id: product.id },
            data: {
              price: product.originalPrice ?? product.price,
              originalPrice: null,
              isSale: false,
            },
          });
        }

        const basePrice = product.originalPrice ?? product.price;
        const discountedPrice = Math.round(basePrice * (1 - Number(body.percent) / 100) * 100) / 100;
        return prisma.product.update({
          where: { id: product.id },
          data: {
            price: discountedPrice,
            originalPrice: basePrice,
            isSale: true,
          },
        });
      }));

      return NextResponse.json({ success: true, updatedCount: existingProducts.length });
    }

    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    if (updates.price !== undefined) updates.price = parseFloat(updates.price);
    if (updates.originalPrice !== undefined) {
      updates.originalPrice = updates.originalPrice === "" || updates.originalPrice === null
        ? null
        : parseFloat(updates.originalPrice);
      if (updates.originalPrice !== null && (!Number.isFinite(updates.originalPrice) || updates.originalPrice <= (updates.price ?? (await prisma.product.findUnique({ where: { id }, select: { price: true } }))?.price ?? 0))) {
        return NextResponse.json({ error: "Original price must be greater than the current selling price" }, { status: 400 });
      }
    }
    if (updates.images !== undefined) {
      if (!Array.isArray(updates.images) || !updates.images.every((url: unknown) => typeof url === "string")) {
        return NextResponse.json({ error: "Product images must be a list of image URLs" }, { status: 400 });
      }
      updates.images = [...new Set(updates.images.map((url: string) => url.trim()).filter(Boolean))];
    }
    if (updates.stock !== undefined) {
      updates.stock = parseInt(updates.stock, 10);
      updates.inStock = updates.stock > 0;
    }

    const updated = await updateProduct(id, updates);
    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aura_admin_token")?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
