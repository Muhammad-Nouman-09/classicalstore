"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildProductsFilterHref } from "@/lib/categorySystem";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/productUtils";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const navLinks = [
  { href: buildProductsFilterHref({ category: "Clothes" }), label: "Clothes" },
  { href: buildProductsFilterHref({ category: "Bags" }), label: "Bags" },
  { href: buildProductsFilterHref({ category: "Cosmetics" }), label: "Cosmetics" },
  { href: buildProductsFilterHref({ category: "Jewellery" }), label: "Jewellery" },
  { href: buildProductsFilterHref({ category: "Accessories" }), label: "Accessories" },
  { href: buildProductsFilterHref({ category: "Shoes" }), label: "Shoes" },
];

const ADMIN_EMAILS = ["mnouman.developer@gmail.com", "cclassicalstore@gmail.com"];

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 8h14l-1 11H6L5 8Z" />
      <path d="M9 8a3 3 0 1 1 6 0" />
    </svg>
  );
}

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newAdminOrders, setNewAdminOrders] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountHref, setAccountHref] = useState("/auth");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCatalogQuery = searchParams.get("q") ?? "";

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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        setNewAdminOrders((count) => count + 1);
      })
      .subscribe();

    const syncAccountLink = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthUser(session?.user ?? null);
      setAccountHref(session?.user ? "/profile" : "/auth");
    };

    void syncAccountLink();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAccountHref(session?.user ? "/profile" : "/auth");
    });

    return () => {
      window.removeEventListener("storage", onCartChange);
      window.removeEventListener("cart:update", onCartChange);
      supabase.removeChannel(supabaseChannel);
      authSubscription.unsubscribe();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const profileBadge = authUser?.email?.trim()?.charAt(0)?.toUpperCase() ?? "P";
  const isAdmin = authUser?.email ? ADMIN_EMAILS.includes(authUser.email.toLowerCase()) : false;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();
    const nextUrl = query ? `/products?q=${encodeURIComponent(query)}` : "/products";

    setSearchOpen(false);
    setMenuOpen(false);
    router.push(nextUrl);
  };

  const handleSearchClick = () => {
    if (searchOpen) {
      setSearchOpen(false);
      return;
    }

    setSearchQuery(pathname === "/products" ? currentCatalogQuery : "");
    setSearchOpen(true);
  };

  const AccountButton = (
    <Link href={accountHref} className="icon-button text-[var(--foreground)]" aria-label="Account" onClick={closeMenu}>
      {authUser ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)] text-xs font-semibold text-white">
          {profileBadge}
        </span>
      ) : (
        <UserIcon />
      )}
    </Link>
  );

  const CartButton = (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
      onClick={closeMenu}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)] text-white">
        <BagIcon />
      </span>
      <span>Cart</span>
      {cartCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-white">
          {cartCount}
        </span>
      )}
      {cartCount > 0 && <span className="hidden text-xs text-[var(--muted)] sm:inline">{formatPrice(cartTotal)}</span>}
    </Link>
  );

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(255,252,247,0.88)] backdrop-blur"
      suppressHydrationWarning
    >
      <div
        className="border-b border-[var(--border)] bg-[var(--card-tint)] px-4 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]"
        suppressHydrationWarning
      >
        Free delivery over Rs 2000 
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6" suppressHydrationWarning>
        <Link href="/" className="flex items-center gap-3 text-[var(--foreground)]" onClick={closeMenu}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white text-sm font-semibold tracking-[0.26em] shadow-sm">
            CS
          </span>
          <div suppressHydrationWarning>
            <p className="text-base font-semibold tracking-[-0.03em]">Classical Store</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Fashion and lifestyle</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:hidden" suppressHydrationWarning>
          <button className="icon-button text-[var(--foreground)]" aria-label="Search" onClick={handleSearchClick}>
            <SearchIcon />
          </button>
          {AccountButton}
          <button
            className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] p-2.5 text-[var(--foreground)]"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--muted)]"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex" suppressHydrationWarning>
          <button className="icon-button text-[var(--foreground)]" aria-label="Search" onClick={handleSearchClick}>
            <SearchIcon />
          </button>
          {AccountButton}
          {CartButton}
          {isAdmin ? (
            <Link
              href="/admin"
              className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
              onClick={() => {
                setNewAdminOrders(0);
                closeMenu();
              }}
            >
              Admin
              {newAdminOrders > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">
                  {newAdminOrders}
                </span>
              )}
            </Link>
          ) : null}
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-[var(--border)] bg-[rgba(255,252,247,0.96)]" suppressHydrationWarning>
          <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearchSubmit}>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
                placeholder="Search products, categories, or styles"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
                >
                  Search
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
                  onClick={() => setSearchOpen(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div
        className={`overflow-hidden border-t border-[var(--border)] bg-[rgba(255,252,247,0.96)] transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
        suppressHydrationWarning
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4" suppressHydrationWarning>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 flex items-center gap-2" suppressHydrationWarning>
            {CartButton}
          </div>

          <form className="mt-3 flex gap-3" onSubmit={handleSearchSubmit}>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
              placeholder="Search products"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--foreground-soft)]"
            >
              Go
            </button>
          </form>

          {isAdmin ? (
            <Link
              href="/admin"
              className="pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
              onClick={() => {
                setNewAdminOrders(0);
                closeMenu();
              }}
            >
              Admin
              {newAdminOrders > 0 ? ` (${newAdminOrders})` : ""}
            </Link>
          ) : null}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(17,17,17,0.2)]">
          {toastMessage}
        </div>
      )}
    </header>
  );
}
