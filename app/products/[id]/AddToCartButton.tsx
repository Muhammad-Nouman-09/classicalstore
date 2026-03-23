"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
};

type CartItem = Product & { quantity: number };

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timeout);
  }, [added]);

  const addToCart = () => {
    if (typeof window === "undefined") return;

    const existing = window.localStorage.getItem("cart");
    const cart: CartItem[] = existing ? JSON.parse(existing) : [];
    const idx = cart.findIndex((item) => item.id === product.id);

    if (idx >= 0) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    window.localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);

    // Notify other components in same tab (storage event is cross-tab only)
    window.dispatchEvent(new CustomEvent("cart:update", { detail: "Added to cart" }));
  };

  return (
    <button
      onClick={addToCart}
      className="rounded-md border border-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
    >
      {added ? "Added!" : "Add to cart"}
    </button>
  );
}
