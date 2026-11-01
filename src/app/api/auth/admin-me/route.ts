import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("aura_admin_token")?.value;
    const legacyToken = cookieStore.get("aura_auth_token")?.value;

    // Support administrator sessions created before the cookie split.
    const adminPayload = adminToken ? await verifyToken(adminToken) : null;
    const legacyPayload = !adminPayload && legacyToken ? await verifyToken(legacyToken) : null;
    const payload = adminPayload?.role === "ADMIN"
      ? adminPayload
      : legacyPayload?.role === "ADMIN"
        ? legacyPayload
        : null;

    if (!payload) {
      return NextResponse.json({ user: null, reason: "ADMIN_SESSION_MISSING" }, { status: 401 });
    }

    const response = NextResponse.json({
      user: { id: payload.userId, name: payload.name, email: payload.email, role: "ADMIN" },
    });

    // If the only valid admin session uses the old cookie name, migrate it here too.
    if (!adminToken && legacyToken && legacyPayload?.role === "ADMIN") {
      response.cookies.set("aura_admin_token", legacyToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
      response.cookies.set("aura_auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }

    // Confirm the user still exists and has administrator privileges when the DB is available.
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, email: true, role: true },
      });
      if (dbUser && dbUser.role !== "ADMIN") {
        response.cookies.set("aura_admin_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        });
        return NextResponse.json({ user: null, reason: "ADMIN_ROLE_REQUIRED" }, { status: 403 });
      }
      if (dbUser?.role === "ADMIN") {
        return NextResponse.json({ user: dbUser }, { headers: response.headers });
      }
    } catch {
      // The signed admin token is still usable if the database is temporarily unavailable.
    }

    return response;
  } catch (error) {
    console.error("Admin auth check error:", error);
    return NextResponse.json({ user: null, reason: "AUTH_CHECK_FAILED" }, { status: 500 });
  }
}
