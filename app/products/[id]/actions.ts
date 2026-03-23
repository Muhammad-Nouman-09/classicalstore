'use server';

import { supabase } from "@/lib/supabase";

export async function submitOrder(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const productId = formData.get('productId') as string;
  const quantity = Number(formData.get('quantity'));

  if (!name || !phone || !address || !productId || !quantity || quantity < 1) {
    throw new Error("Please provide all required fields.");
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      name,
      phone,
      address,
      product_id: productId,
      quantity,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate or redirect, but for now, just succeed
}