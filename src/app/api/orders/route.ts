import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getOrdersByUserId, getAllOrders, updateOrderStatus } from "@/lib/db";
import { Order } from "@/types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("aura_admin_token")?.value;
    const admin = adminToken ? await verifyToken(adminToken) : null;
    if (admin?.role === "ADMIN") {
      const orders: Order[] = await getAllOrders();
      return NextResponse.json({ orders });
    }

    const customerToken = cookieStore.get("aura_auth_token")?.value;
    const customer = customerToken ? await verifyToken(customerToken) : null;
    if (!customer || customer.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Please sign in to view orders." }, { status: 401 });
    }

    const orders: Order[] = await getOrdersByUserId(customer.userId);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aura_admin_token")?.value;
    const payload = token ? await verifyToken(token) : null;

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin permission required" }, { status: 403 });
    }

    const body = await req.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const status = typeof body.status === "string" ? body.status : "";
    const allowedStatuses = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!orderId || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "A valid order ID and status are required" }, { status: 400 });
    }

    const updated = await updateOrderStatus(orderId, status);
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Orders PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
