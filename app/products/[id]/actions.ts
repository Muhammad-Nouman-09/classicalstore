'use server';

import { supabase } from "@/lib/supabase";
import { validateOrderInput } from "@/lib/orderValidation";

export async function submitOrder(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  const productId = formData.get('productId') as string;
  const quantity = Number(formData.get('quantity'));
  const validation = validateOrderInput({ name, phone, email, address, productId, quantity });

  if ("error" in validation) {
    throw new Error(validation.error);
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...validation.orderData,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate or redirect, but for now, just succeed
}
