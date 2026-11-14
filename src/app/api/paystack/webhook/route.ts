import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { getOrderByReference, updateOrderPaymentSuccess } from "@/lib/db";
import { sendOrderReceiptEmail } from "@/lib/receipt-email";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-paystack-signature");

    // 1 & 2. Verify webhook signature
    const isValidSignature = verifyPaystackWebhookSignature(rawBody, signature);

    if (!isValidSignature && process.env.NODE_ENV === "production") {
      console.warn("Invalid Paystack webhook signature rejected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // 3. Listen for charge.success event
    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;

      if (!reference) {
        return NextResponse.json({ error: "Missing reference" }, { status: 400 });
      }

      // 4. Find corresponding order
      const order = await getOrderByReference(reference);
      if (!order) {
        console.warn(`Webhook received for unknown reference: ${reference}`);
        // Return 200 so Paystack stops retrying
        return NextResponse.json({ message: "Order not found" }, { status: 200 });
      }

      // 5 & 6. Idempotency: Ensure order not already marked as paid
      if (order.status === "PAID" && order.paymentStatus === "SUCCESS") {
        // Retry the receipt if an earlier delivery attempt failed. Resend uses
        // an order-specific idempotency key to prevent duplicate customer emails.
        const receiptSent = await sendOrderReceiptEmail(order);
        if (!receiptSent) {
          return NextResponse.json(
            { error: "Payment is confirmed, but the receipt email could not be sent yet." },
            { status: 500 }
          );
        }
        console.log(`Webhook: Order ${order.orderNumber} was already paid; receipt delivery checked.`);
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      // 7, 8, 9. Update payment status, order status, and inventory safely
      const updatedOrder = await updateOrderPaymentSuccess({
        reference,
        paystackId: String(data.id),
        channel: data.channel,
        amount: order.totalAmount,
      });

      if (!updatedOrder) {
        return NextResponse.json(
          { error: "Payment was received, but the order could not be updated." },
          { status: 500 }
        );
      }

      // Send the same custom receipt used by the customer verification flow.
      // A failed send returns 500 so Paystack can retry the webhook.
      const receiptSent = await sendOrderReceiptEmail(updatedOrder);
      if (!receiptSent) {
        return NextResponse.json(
          { error: "Payment is confirmed, but the receipt email could not be sent yet." },
          { status: 500 }
        );
      }

      console.log(`Webhook: Successfully confirmed order ${order.orderNumber} and sent receipt (Ref: ${reference})`);
    }

    // 10. Return successful response
    return NextResponse.json({ status: true }, { status: 200 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
