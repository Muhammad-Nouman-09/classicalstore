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

  const CartButton = (
    <Link
      href="/cart"
      className="group relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-fuchsia-200 hover:shadow-md"
      onClick={closeMenu}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-orange-400 text-[11px] font-bold text-white">
        Bag
      </span>
      <span className="hidden sm:inline">Cart</span>
      {cartCount > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
          {cartCount}
        </span>
      )}
      {cartCount > 0 && <span className="text-xs text-slate-500">${cartTotal.toFixed(2)}</span>}
    </Link>
  );

  return (
    <div className="sticky top-0 z-30 border-b border-slate-100 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 hover:text-fuchsia-600">
          <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-orange-400 p-[2px] shadow-lg shadow-fuchsia-200">
            <span className="flex h-full w-full items-center justify-center rounded-2xl bg-white text-fuchsia-600">CS</span>
          </span>
          <span>Classical Store</span>
        </Link>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 md:hidden"
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

        <div className="hidden items-center space-x-5 md:flex text-slate-800">
          <Link href="/" className="text-sm font-semibold hover:text-fuchsia-600 transition-colors" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/products" className="text-sm font-semibold hover:text-fuchsia-600 transition-colors" onClick={closeMenu}>
            Shop
          </Link>
          <Link href="#categories" className="text-sm font-semibold hover:text-fuchsia-600 transition-colors" onClick={closeMenu}>
            Categories
          </Link>
          <Link href="/contact" className="text-sm font-semibold hover:text-fuchsia-600 transition-colors" onClick={closeMenu}>
            Contact
          </Link>
          <Link
            href="/admin"
            className="relative text-sm font-semibold hover:text-fuchsia-600 transition-colors"
            onClick={() => {
              setNewAdminOrders(0);
              closeMenu();
            }}
          >
            Admin
            {newAdminOrders > 0 && (
              <span className="absolute -top-2 -right-3 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {newAdminOrders}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-3">
            <button className="icon-button text-slate-700" aria-label="Search">
              ??
            </button>
            <button className="icon-button text-slate-700" aria-label="Account">
              ??
            </button>
            {CartButton}
          </div>
        </div>
      </div>

      <div
        className={`md:hidden ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-100 bg-white/95 p-4 shadow-lg shadow-slate-100 backdrop-blur">
          <Link href="/" className="text-sm font-semibold text-slate-900" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/products" className="text-sm font-semibold text-slate-900" onClick={closeMenu}>
            Shop
          </Link>
          <Link href="#categories" className="text-sm font-semibold text-slate-900" onClick={closeMenu}>
            Categories
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-slate-900" onClick={closeMenu}>
            Contact
          </Link>
          <Link
            href="/admin"
            className="relative text-sm font-semibold text-slate-900"
            onClick={() => {
              setNewAdminOrders(0);
              closeMenu();
            }}
          >
            Admin
            {newAdminOrders > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {newAdminOrders}
              </span>
            )}
          </Link>
          <div className="flex gap-2 pt-1">
            <button className="icon-button text-slate-700" aria-label="Search" onClick={closeMenu}>
              ??
            </button>
            <button className="icon-button text-slate-700" aria-label="Account" onClick={closeMenu}>
              ??
            </button>
            {CartButton}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-900 p-3 text-sm text-white shadow-md">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
