import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getCategories, prisma } from "@/lib/db";
import { initialCategories } from "@/lib/data";

export async function GET() {
  try {
    // Seed the standard categories on a new database so product creation always
    // has valid category records to reference.
    for (const category of initialCategories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
        },
      });
    }

    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch categories" },
      { status: 500 }
    );
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) {
      return NextResponse.json({ error: "Enter a valid category name" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A category with that name already exists" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        id: `category-${slug}`,
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create category" },
      { status: 500 }
    );
  }
}
