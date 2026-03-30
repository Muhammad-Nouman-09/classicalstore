import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { name, phone, address, productId, quantity, userId } = await req.json();

  if (!name || !phone || !address || !productId || !quantity) {
    return NextResponse.json(
      { error: "Please provide name, phone, address, productId, and quantity." },
      { status: 400 }
    );
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    return NextResponse.json({ error: "Quantity must be at least 1." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      name,
      phone,
      address,
      product_id: productId,
      quantity: parsedQuantity,
      user_id: userId || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data }, { status: 201 });
}
