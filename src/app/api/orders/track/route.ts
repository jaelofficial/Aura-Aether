import { NextResponse } from "next/server";
import { getOrderByOrderNumber } from "@/lib/db";

export async function GET(request: Request) {
  const orderNumber = new URL(request.url).searchParams.get("orderId")?.trim();

  if (!orderNumber || orderNumber.length > 40) {
    return NextResponse.json(
      { error: "Enter a valid order ID." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const order = await getOrderByOrderNumber(orderNumber);

    if (!order) {
      return NextResponse.json(
        { error: "We could not find an order with that ID. Check the number and try again." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Public tracking deliberately excludes customer contact and delivery details.
    return NextResponse.json(
      {
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Order tracking lookup failed:", error);
    return NextResponse.json(
      { error: "Order tracking is temporarily unavailable. Please try again shortly." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
