import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/orderEmails";
import { validateOrderInput } from "@/lib/orderValidation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { name, phone, email, address, productId, quantity, userId } = await req.json();
  const validation = validateOrderInput({ name, phone, email, address, productId, quantity });

  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { orderData } = validation;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("name, price")
    .eq("id", orderData.product_id)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "Unable to find the selected product." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...orderData,
      user_id: userId || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailStatus: "sent" | "skipped" | "failed" = "sent";
  let emailMessage: string | null = null;

  try {
    const emailResult = await sendOrderConfirmationEmail({
      customerEmail: orderData.email,
      customerName: orderData.name,
      orderId: data.id,
      productName: product.name,
      quantity: orderData.quantity,
      unitPrice: product.price,
    });

    if (emailResult.skipped) {
      console.warn("Order confirmation email skipped:", emailResult.reason);
      emailStatus = "skipped";
      emailMessage = emailResult.reason;
    }
  } catch (emailError) {
    console.error("Order confirmation email error:", emailError);
    emailStatus = "failed";
    emailMessage = emailError instanceof Error ? emailError.message : "Failed to send confirmation email.";
  }

  return NextResponse.json({ order: data, emailStatus, emailMessage }, { status: 201 });
}
