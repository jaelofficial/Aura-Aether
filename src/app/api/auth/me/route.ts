import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    // This endpoint reports only the storefront/customer session.
    // Admin authentication is intentionally handled separately.
    const token = cookieStore.get("aura_auth_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "CUSTOMER") {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          city: true,
        },
      });

      if (dbUser && dbUser.role === "CUSTOMER") {
        return NextResponse.json({ user: dbUser });
      }
    } catch {
      // Postgres fallback
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
