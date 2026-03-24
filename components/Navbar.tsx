"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const updateCartInfo = () => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        try {
          const items: CartItem[] = JSON.parse(cart);
          const count = items.reduce((sum, item) => sum + item.quantity, 0);
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          setCartCount(count);
          setCartTotal(total);
          return;
        } catch (error) {
          console.warn("Invalid cart data", error);
        }
      }
      setCartCount(0);
      setCartTotal(0);
    };

    const onCartChange = (event: Event) => {
      updateCartInfo();

      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
        setToastMessage(customEvent.detail);
        window.setTimeout(() => setToastMessage(null), 1800);
      }
    };

    updateCartInfo();
    window.addEventListener("storage", onCartChange);
    window.addEventListener("cart:update", onCartChange);

    return () => {
      window.removeEventListener("storage", onCartChange);
      window.removeEventListener("cart:update", onCartChange);
    };
  }, []);

  return (
    <div className="flex justify-between items-center p-4 border-b bg-black/50">
      <Link href="/" className="text-xl font-bold hover:text-gray-300">
        MyStore
      </Link>
      
      <div className="flex items-center space-x-6">
        <Link href="/products" className="hover:text-gray-300 transition">
          Products
        </Link>
        
        <Link href="/admin" className="hover:text-gray-300 transition">
          Admin
        </Link>
        
        <Link 
          href="/cart" 
          className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition"
        >
          <span>🛒 Cart</span>
          {cartCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full font-semibold">
              {cartCount}
            </span>
          )}
          {cartCount > 0 && (
            <span className="text-sm text-gray-300">${cartTotal.toFixed(2)}</span>
          )}
        </Link>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-black/85 p-3 text-sm text-white shadow-md z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}