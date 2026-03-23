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

    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
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
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-center text-gray-400">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/products" className="text-sm text-gray-400 hover:text-white mb-6 inline-block">
        {"← Back to products"}
      </Link>

      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400 mb-4">Your cart is empty</p>
          <Link
            href="/products"
            className="inline-block bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-gray-100 transition"
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
                className="flex gap-4 p-4 border border-gray-800 rounded-lg bg-black/40"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-900 rounded-md flex-shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No image</span>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-400">${item.price.toFixed(2)} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 border border-gray-700 rounded hover:border-white transition"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 border border-gray-700 rounded hover:border-white transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="text-right flex flex-col justify-between">
                  <p className="text-xl font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 transition text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="w-full mt-4 px-4 py-2 border border-red-600 text-red-400 rounded-md hover:bg-red-600/10 transition"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="p-6 border border-gray-800 rounded-lg bg-black/40 space-y-4 sticky top-20">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-2 border-b border-gray-700 pb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button className="w-full bg-white text-black py-3 rounded-md font-semibold hover:bg-gray-100 transition">
                Proceed to Checkout
              </button>

              <Link
                href="/products"
                className="block text-center text-gray-400 hover:text-white text-sm transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
