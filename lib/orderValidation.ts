export const MIN_PHONE_DIGITS = 11;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string) {
  return normalizePhone(value).length >= MIN_PHONE_DIGITS;
}

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim());
}

export function validateOrderInput(input: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  productId?: string | null;
  quantity?: number | string | null;
}) {
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const address = input.address?.trim() ?? "";
  const productId = input.productId?.trim() ?? "";
  const quantity = Number(input.quantity);

  if (!name || !phone || !email || !address || !productId || !quantity) {
    return { error: "Please provide name, phone, email, address, product, and quantity." };
  }

  if (!isValidPhone(phone)) {
    return { error: `Phone number must contain at least ${MIN_PHONE_DIGITS} digits.` };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    return { error: "Quantity must be at least 1." };
  }

  return {
    orderData: {
      name,
      phone,
      email,
      address,
      product_id: productId,
      quantity,
    },
  };
}
