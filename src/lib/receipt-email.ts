import { Order } from "@/types";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function money(value: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Sends a branded customer receipt after the server has verified payment.
 * Resend's idempotency key prevents duplicate receipts when the success page
 * retries verification for the same order.
 */
export async function sendOrderReceiptEmail(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn(
      "Order receipt email was not sent: configure RESEND_API_KEY and CONTACT_FROM_EMAIL."
    );
    return;
  }

  const customerName = escapeHtml(order.customerName);
  const orderNumber = escapeHtml(order.orderNumber);
  const paymentReference = escapeHtml(order.paymentReference);
  const paymentChannel = escapeHtml(order.payment?.channel || "Paystack");
  const paidAt = new Date(order.payment?.paidAt || new Date()).toLocaleString("en-GH", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Accra",
  });

  const itemRows = order.items
    .map((item) => {
      const name = escapeHtml(item.productName);
      const size = item.size ? ` <span style="color:#8b8177;">(${escapeHtml(item.size)})</span>` : "";
      const lineTotal = money(item.productPrice * item.quantity);
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eee7df;">
            <div style="font-weight:600;color:#29231e;">${name}${size}</div>
            <div style="font-size:12px;color:#8b8177;margin-top:4px;">Qty: ${item.quantity} × ${money(item.productPrice)}</div>
          </td>
          <td align="right" style="padding:14px 0;border-bottom:1px solid #eee7df;white-space:nowrap;color:#29231e;">${lineTotal}</td>
        </tr>`;
    })
    .join("");

  const textItems = order.items
    .map((item) => `${item.productName}${item.size ? ` (${item.size})` : ""} — Qty ${item.quantity} — ${money(item.productPrice * item.quantity)}`)
    .join("\n");

  const textBody = [
    "AURA & AETHER PARFUMS",
    "PAYMENT RECEIPT",
    "",
    `Hello ${order.customerName},`,
    "Thank you for your order. Your payment has been verified successfully.",
    "",
    `Order ID: ${order.orderNumber}`,
    `Paystack reference: ${order.paymentReference}`,
    `Payment method: ${order.payment?.channel || "Paystack"}`,
    `Payment date: ${paidAt}`,
    "Payment status: PAID",
    "",
    "ITEMS",
    textItems,
    "",
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery: ${order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}`,
    `TOTAL PAID: ${money(order.totalAmount)}`,
    "",
    "DELIVERY DETAILS",
    order.customerName,
    order.customerEmail,
    order.customerPhone,
    order.deliveryAddress,
    order.city,
    "",
    "Please keep your Order ID to track your delivery.",
    "Thank you for choosing Aura & Aether Parfums.",
  ].join("\n");

  const html = `
    <div style="margin:0;padding:32px 12px;background:#f7f4f0;font-family:Arial,Helvetica,sans-serif;color:#29231e;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e9e1d8;">
        <div style="padding:34px 28px;text-align:center;background:#211d19;color:#ffffff;">
          <div style="font-family:Georgia,serif;font-size:25px;letter-spacing:2px;">AURA &amp; AETHER</div>
          <div style="margin-top:7px;font-size:10px;letter-spacing:3px;color:#d8bd91;">PARFUMS</div>
          <div style="width:42px;height:1px;background:#c5a36d;margin:22px auto;"></div>
          <div style="font-size:11px;letter-spacing:2px;color:#e7d8c3;">PAYMENT RECEIPT</div>
        </div>

        <div style="padding:30px 28px;">
          <div style="font-size:12px;letter-spacing:1.5px;color:#9b805c;font-weight:bold;">PAYMENT CONFIRMED</div>
          <h1 style="font-family:Georgia,serif;font-size:25px;font-weight:normal;margin:10px 0 8px;">Thank you, ${customerName}.</h1>
          <p style="font-size:14px;line-height:1.7;color:#71675e;margin:0 0 24px;">Your payment was successful. This email is your official Aura &amp; Aether Parfums receipt.</p>

          <div style="padding:18px;background:#faf7f3;border:1px solid #eee6dc;margin-bottom:26px;">
            <div style="font-size:10px;letter-spacing:1.5px;color:#8b8177;">YOUR ORDER ID</div>
            <div style="font-family:Georgia,serif;font-size:21px;font-weight:bold;letter-spacing:.5px;margin-top:7px;color:#29231e;">${orderNumber}</div>
            <div style="font-size:11px;color:#8b8177;margin-top:8px;">Keep this number to track your order.</div>
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:12px;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:7px 0;color:#8b8177;">Payment status</td><td align="right" style="padding:7px 0;font-weight:bold;color:#28734d;">PAID</td></tr>
            <tr><td style="padding:7px 0;color:#8b8177;">Payment date</td><td align="right" style="padding:7px 0;color:#29231e;">${escapeHtml(paidAt)}</td></tr>
            <tr><td style="padding:7px 0;color:#8b8177;">Payment method</td><td align="right" style="padding:7px 0;color:#29231e;">${paymentChannel}</td></tr>
            <tr><td style="padding:7px 0;color:#8b8177;">Paystack reference</td><td align="right" style="padding:7px 0;color:#29231e;word-break:break-all;">${paymentReference}</td></tr>
          </table>

          <div style="font-family:Georgia,serif;font-size:18px;margin-bottom:8px;">Order summary</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:13px;">
            ${itemRows}
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;border-collapse:collapse;margin-top:16px;">
            <tr><td style="padding:7px 0;color:#71675e;">Subtotal</td><td align="right" style="padding:7px 0;">${money(order.subtotal)}</td></tr>
            <tr><td style="padding:7px 0;color:#71675e;">Delivery fee</td><td align="right" style="padding:7px 0;">${order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}</td></tr>
            <tr><td style="padding:15px 0;border-top:1px solid #ded5ca;font-weight:bold;font-size:15px;">TOTAL PAID</td><td align="right" style="padding:15px 0;border-top:1px solid #ded5ca;font-weight:bold;font-size:16px;">${money(order.totalAmount)}</td></tr>
          </table>

          <div style="margin-top:26px;padding-top:22px;border-top:1px solid #eee7df;">
            <div style="font-family:Georgia,serif;font-size:17px;margin-bottom:10px;">Delivery details</div>
            <div style="font-size:12px;line-height:1.8;color:#71675e;">
              <strong style="color:#29231e;">${customerName}</strong><br/>
              ${escapeHtml(order.customerEmail)}<br/>
              ${escapeHtml(order.customerPhone)}<br/>
              ${escapeHtml(order.deliveryAddress)}<br/>
              ${escapeHtml(order.city)}, Ghana
            </div>
          </div>
        </div>

        <div style="padding:23px 28px;text-align:center;background:#faf7f3;border-top:1px solid #eee7df;">
          <div style="font-family:Georgia,serif;font-size:16px;color:#29231e;">Your scent. Your signature.</div>
          <p style="font-size:11px;line-height:1.6;color:#8b8177;margin:8px 0 0;">Thank you for choosing Aura &amp; Aether Parfums.</p>
        </div>
      </div>
    </div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `aura-order-receipt-${order.id}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [order.customerEmail],
        subject: `Your Aura & Aether receipt — ${order.orderNumber}`,
        text: textBody,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Could not read Resend response");
      console.error("Order receipt email failed:", { status: response.status, body: errorBody });
      return;
    }

    console.log("Order receipt email sent:", order.orderNumber);
  } catch (error) {
    // Email failure must not undo or hide a payment that Paystack has verified.
    console.error("Could not send order receipt email:", error);
  }
}
