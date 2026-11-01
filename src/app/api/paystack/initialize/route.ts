import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getProductById, createOrder, prisma } from "@/lib/db";
import { initializePaystackTransaction } from "@/lib/paystack";
import { OrderItem } from "@/types";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("aura_admin_token")?.value;
    const adminPayload = adminToken ? await verifyToken(adminToken) : null;
    if (adminPayload?.role === "ADMIN") {
      return NextResponse.json({ error: "Administrator accounts cannot place customer orders." }, { status: 403 });
    }
    const customerToken = cookieStore.get("aura_auth_token")?.value;
    const customerPayload = customerToken ? await verifyToken(customerToken) : null;
    if (customerPayload?.role === "ADMIN") {
      return NextResponse.json({ error: "Administrator accounts cannot place customer orders. Please sign in with a customer account." }, { status: 403 });
    }
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      city,
      deliveryRange,
      notes,
      items,
    } = body;

    // 1. Validation
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !deliveryAddress ||
      !city ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Please provide all required delivery and contact details." },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    // 2. Retrieve actual products from database & validate availability
    let calculatedSubtotal = 0;
    const validatedOrderItems: OrderItem[] = [];

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item in cart." },
          { status: 400 }
        );
      }

      const product = await getProductById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name || "Item"}" is no longer available.` },
          { status: 400 }
        );
      }

      // Check stock
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: "", // will be set on order creation
        productId: product.id,
        productName: product.name,
        productPrice: product.price, // Immutable price snapshot
        quantity: item.quantity,
        size: product.size,
        image: product.image,
      });
    }

    // 3. Resolve delivery price from admin-managed settings on the server.
    // Never trust a fee supplied by the browser.
    const settingRows = await prisma.siteSetting.findMany({
      where: { key: { in: ["deliveryFreePromo", "deliveryRanges"] } },
    });
    const deliverySettings = Object.fromEntries(settingRows.map((row) => [row.key, row.value]));
    const configuredRanges = String(deliverySettings.deliveryRanges || "")
      .split("\n")
      .map((line) => {
        const [label, feeText] = line.split("|");
        return { label: (label || "").trim(), fee: Number((feeText || "").trim()) };
      })
      .filter((range) => range.label && Number.isFinite(range.fee) && range.fee >= 0);
    const selectedDeliveryRange = configuredRanges.find((range) => range.label === String(deliveryRange || "").trim());
    const freeDeliveryPromo = deliverySettings.deliveryFreePromo === "true";
    if (!freeDeliveryPromo && !selectedDeliveryRange) {
      return NextResponse.json({ error: "Please select a valid delivery range. Refresh checkout and try again." }, { status: 400 });
    }
    const deliveryFee = freeDeliveryPromo ? 0 : selectedDeliveryRange!.fee;
    const finalTotal = calculatedSubtotal + deliveryFee;

    // 4. Generate unique transaction reference & human-readable order number
    const timestamp = Date.now();
    const randomHex = Math.floor(Math.random() * 0xfffff).toString(16);
    const paymentReference = `AA-${timestamp}-${randomHex}`.toUpperCase();
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 5. Create PENDING Order in Database
    const order = await createOrder({
      orderNumber,
      userId: customerPayload?.role === "CUSTOMER" ? customerPayload.userId : null,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      city: city.trim(),
      notes: [notes?.trim(), `Delivery range selected: ${freeDeliveryPromo ? "Free delivery promotion" : selectedDeliveryRange!.label}`].filter(Boolean).join("\n") || null,
      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount: finalTotal,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentReference,
      items: validatedOrderItems,
    });

    // 6. Base URL for callback redirect
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    const callback_url = `${origin}/order/success`;

    // 7. Initialize Paystack Transaction from server with exact smallest denomination
    const paystackResponse = await initializePaystackTransaction({
      email: customerEmail.trim().toLowerCase(),
      amount: finalTotal, // Handled by ghsToPesewas inside helper
      reference: paymentReference,
      callback_url,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: customerName.trim(),
        itemCount: validatedOrderItems.reduce((acc, i) => acc + i.quantity, 0),
        custom_fields: [
          {
            display_name: "Order Number",
            variable_name: "order_number",
            value: order.orderNumber,
          },
          {
            display_name: "Delivery City",
            variable_name: "delivery_city",
            value: city.trim(),
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: paymentReference,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Paystack initialization handler error:", error);
    return NextResponse.json(
      { error: "Could not initiate payment. Please try again." },
      { status: 500 }
    );
  }
}
