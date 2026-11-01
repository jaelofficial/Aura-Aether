import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

function validPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && value.length <= 180;
}

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("aura_admin_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  return !!payload && payload.role === "ADMIN";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "/";
  if (!validPath(path)) return NextResponse.json({ error: "Invalid page path" }, { status: 400 });
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: `visualEdits:${path}` } });
    const edits = row?.value ? JSON.parse(row.value) : { items: [], order: [] };
    return NextResponse.json(edits, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ items: [], order: [] });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
  try {
    const body = await req.json();
    if (!validPath(body.path)) return NextResponse.json({ error: "Invalid page path" }, { status: 400 });
    const items = Array.isArray(body.items) ? body.items.slice(0, 500) : [];
    const order = Array.isArray(body.order) ? body.order.slice(0, 30) : [];
    const safeItems = items.filter((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const value = item as Record<string, unknown>;
      return typeof value.selector === "string" && value.selector.length <= 1000 &&
        ["text", "image", "link"].includes(String(value.type)) &&
        typeof value.value === "string" && value.value.length <= 12000;
    });
    const safeOrder = order.filter((value: unknown) => typeof value === "string" && value.length <= 1000);
    const key = `visualEdits:${body.path}`;
    const value = JSON.stringify({ items: safeItems, order: safeOrder });
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visual edits save error:", error);
    return NextResponse.json({ error: "Could not save visual changes." }, { status: 500 });
  }
}
