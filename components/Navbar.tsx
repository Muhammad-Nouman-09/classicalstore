"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [newAdminOrders, setNewAdminOrders] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

    const supabaseChannel = supabase
      .channel("admin_order_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          setNewAdminOrders((count) => count + 1);
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("storage", onCartChange);
      window.removeEventListener("cart:update", onCartChange);
      supabase.removeChannel(supabaseChannel);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const NavLinks = (
    <>
      <Link href="/products" className="text-white hover:text-emerald-100 transition" onClick={closeMenu}>
        Products
      </Link>
      <Link href="/about" className="text-white hover:text-emerald-100 transition" onClick={closeMenu}>
        About
      </Link>
      <Link
        href="/admin"
        className="relative text-white hover:text-emerald-100 transition"
        onClick={() => {
          setNewAdminOrders(0);
          closeMenu();
        }}
      >
        Admin
        {newAdminOrders > 0 && (
          <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
            {newAdminOrders}
          </span>
        )}
      </Link>
      <Link href="/contact" className="hover:text-gray-300 transition" onClick={closeMenu}>
        Contact
      </Link>
    </>
  );

  const CartButton = (
    <Link
      href="/cart"
      className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-white hover:bg-white/25 transition"
      onClick={closeMenu}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-white/20 text-xs font-semibold">C</span>
      <span>Cart</span>
      {cartCount > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
          {cartCount}
        </span>
      )}
      {cartCount > 0 && <span className="text-sm text-gray-300">${cartTotal.toFixed(2)}</span>}
    </Link>
  );

  return (
    <div className="relative border-b border-emerald-200 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-600 px-4 py-3 shadow-lg shadow-emerald-100">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white hover:text-emerald-100">
          MyStore
        </Link>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-emerald-800 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div className="hidden items-center space-x-6 md:flex text-emerald-900">
          {NavLinks}
          {CartButton}
        </div>
      </div>

      <div
        className={`md:hidden ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-100 bg-white/90 p-3 shadow-lg shadow-emerald-50 backdrop-blur">
          {NavLinks}
          <div className="pt-1">{CartButton}</div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-emerald-900 p-3 text-sm text-white shadow-md">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

