"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
    setIsLoading(false);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }

    const updated = cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item));
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cart:update", { detail: "Cart updated" }));
  };

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cart:update", { detail: "Item removed" }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    window.dispatchEvent(new CustomEvent("cart:update", { detail: "Cart cleared" }));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-emerald-700">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <Link href="/products" className="text-sm text-emerald-700 hover:text-emerald-500 inline-flex items-center gap-2">
        <span>←</span> Back to products
      </Link>

      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Cart</p>
        <h1 className="text-3xl font-bold text-emerald-900">Shopping Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-emerald-100 bg-white/90 shadow-sm shadow-emerald-50">
          <p className="text-xl text-emerald-800 mb-4">Your cart is empty</p>
          <Link
            href="/products"
            className="inline-block rounded-md bg-emerald-600 px-6 py-2 font-semibold text-white shadow hover:bg-emerald-500 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-lg border border-emerald-100 bg-white/90 shadow-sm shadow-emerald-50"
              >
                {/* Product Image */}
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-emerald-500">No image</span>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900">{item.name}</h3>
                    <p className="text-emerald-700">${item.price.toFixed(2)} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 rounded border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-emerald-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 rounded border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="flex flex-col items-end justify-between">
                  <p className="text-lg font-semibold text-emerald-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-700 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4 rounded-lg border border-emerald-100 bg-white/90 p-6 shadow-sm shadow-emerald-50">
            <h2 className="text-2xl font-semibold text-emerald-900">Summary</h2>
            <div className="space-y-2 text-sm text-emerald-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-emerald-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full rounded-md bg-emerald-600 py-3 font-semibold text-white shadow hover:bg-emerald-500 transition">
              Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full rounded-md border border-emerald-200 py-3 font-semibold text-emerald-800 hover:bg-emerald-50 transition"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
