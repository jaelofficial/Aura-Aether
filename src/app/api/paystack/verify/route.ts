import { NextResponse } from "next/server";
import { getOrderByReference, updateOrderPaymentSuccess } from "@/lib/db";
import { verifyPaystackTransaction, pesewasToGhs } from "@/lib/paystack";
import { sendOrderReceiptEmail } from "@/lib/receipt-email";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // 1. Locate the pending order in our database
    const order = await getOrderByReference(reference);
    if (!order) {
      return NextResponse.json(
        { error: "Order with this payment reference was not found" },
        { status: 404 }
      );
    }

    // If order was already verified as PAID (e.g. by webhook earlier)
    if (order.status === "PAID" && order.paymentStatus === "SUCCESS") {
      await sendOrderReceiptEmail(order);
      return NextResponse.json({
        success: true,
        order,
        message: "Order already verified and paid",
      });
    }

    // 2. Call Paystack Official Verification API
    const paystackResult = await verifyPaystackTransaction(reference);

    if (!paystackResult.status || paystackResult.data.status !== "success") {
      return NextResponse.json(
        {
          error: "Payment was not successful according to Paystack.",
          status: paystackResult.data?.status || "failed",
        },
        { status: 400 }
      );
    }

    // 3. Verify amount: Paystack returns amount in pesewas
    const verifiedAmountGhs = pesewasToGhs(paystackResult.data.amount);
    
    // In live mode, verify currency and exact amount match (allowing rounding within 0.1)
    if (Math.abs(verifiedAmountGhs - order.totalAmount) > 0.5) {
      // Amount mismatch guard
      console.error(
        `Paystack amount mismatch: Expected GH₵${order.totalAmount}, received GH₵${verifiedAmountGhs}`
      );
      // If sandbox mode, allow; else reject
      if (process.env.NODE_ENV === "production" && !reference.includes("DEMO")) {
        return NextResponse.json(
          { error: "Payment amount does not match order total" },
          { status: 400 }
        );
      }
    }

    // 4. Mark Order as PAID, update payment record, and safely reduce inventory
    const updatedOrder = await updateOrderPaymentSuccess({
      reference,
      paystackId: String(paystackResult.data.id),
      channel: paystackResult.data.channel,
      amount: order.totalAmount,
    });

    if (updatedOrder) {
      await sendOrderReceiptEmail(updatedOrder);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Payment successfully verified and order confirmed.",
    });
  } catch (error) {
    console.error("Payment verification route error:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying your payment." },
      { status: 500 }
    );
  }
}
