import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { comparePassword, hashPassword, signToken, verifyToken } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aura_auth_token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "CUSTOMER") return NextResponse.json({ error: "Customer account access required." }, { status: 403 });

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a name and a valid email address." }, { status: 400 });
    }
    if (newPassword && newPassword.length < 8) {
      return NextResponse.json({ error: "Your new password must be at least 8 characters." }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!currentUser) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    const credentialsChanged = email !== currentUser.email || Boolean(newPassword);
    if (credentialsChanged && (!currentPassword || !(await comparePassword(currentPassword, currentUser.password)))) {
      return NextResponse.json({ error: "Enter your current password to change your email or password." }, { status: 400 });
    }

    if (email !== currentUser.email) {
      const emailOwner = await prisma.user.findUnique({ where: { email } });
      if (emailOwner && emailOwner.id !== currentUser.id) {
        return NextResponse.json({ error: "That email address is already in use." }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        city: city || null,
        ...(newPassword ? { password: await hashPassword(newPassword) } : {}),
      },
      select: { id: true, name: true, email: true, role: true, phone: true, address: true, city: true },
    });
    const refreshedToken = await signToken({
      userId: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role as "CUSTOMER" | "ADMIN",
    });
    const response = NextResponse.json({ user: updated, success: true });
    response.cookies.set("aura_auth_token", refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("Account settings update error:", error);
    return NextResponse.json({ error: "Could not update account settings. Please try again." }, { status: 500 });
  }
}
