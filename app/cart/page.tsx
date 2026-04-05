"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderProcessingModal from "@/components/OrderProcessingModal";
import { writePendingOrderNotice } from "@/lib/orderNotice";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/productUtils";
import { isValidEmail, isValidPhone, MIN_PHONE_DIGITS } from "@/lib/orderValidation";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCheckoutContext = async () => {
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        setCart(JSON.parse(cartData));
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      setUserId(user?.id ?? null);
      setIsLoading(false);
    };

    void loadCheckoutContext();

    return () => {
      isMounted = false;
    };
  }, []);

  const syncCart = (updated: CartItem[], message: string) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cart:update", { detail: message }));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }

    const updated = cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item));
    syncCart(updated, "Cart updated");
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

  const handleCheckout = async () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.email.trim() || !customer.address.trim()) {
      setCheckoutError("Please fill in your name, phone, email, and address before checkout.");
      return;
    }

    if (!isValidPhone(customer.phone)) {
      setCheckoutError(`Phone number must contain at least ${MIN_PHONE_DIGITS} digits.`);
      return;
    }

    if (!isValidEmail(customer.email)) {
      setCheckoutError("Please enter a valid email address.");
      return;
    }

    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    setCheckoutError(null);
    setCheckoutLoading(true);

    try {
      const rateProductIds = userId ? cart.map((item) => item.id) : [];

      for (const item of cart) {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            email: customer.email.trim(),
            address: customer.address.trim(),
            productId: item.id,
            quantity: item.quantity,
            userId,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to place order.");
        }
      }

      clearCart();
      writePendingOrderNotice({ rateProductIds });
      router.push("/");
      router.refresh();
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : cart.length > 0 ? 8 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="rounded-[2rem] border border-[var(--border)] bg-white p-10 text-center text-[var(--muted)] shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
          Loading cart...
        </div>
      </div>
    );
  }

  return (
    <>
      {checkoutLoading ? (
        <OrderProcessingModal
          badge="Submitting checkout"
          title="We are confirming your purchase"
          description="Your order items are being saved now. This usually takes just a few seconds."
        />
      ) : null}

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <section className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(244,239,229,0.95),rgba(255,255,255,0.96))] px-6 py-10 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <Link
          href="/products"
          className="inline-flex rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
        >
          Back to products
        </Link>
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Cart</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Your shopping bag</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Review your products, complete the checkout form, and after your order is placed we&apos;ll take you back to the homepage.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-[var(--border)] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Items</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{cart.length}</p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Subtotal</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{formatPrice(subtotal)}</p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Delivery</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{shipping === 0 ? "Free" : formatPrice(shipping)}</p>
            </div>
          </div>
        </div>
      </section>

      {cart.length === 0 ? (
        <section className="mt-8 rounded-[2rem] border border-[var(--border)] bg-white px-6 py-14 text-center shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Nothing here yet</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Your cart is empty</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Start with featured fashion, shoes, accessories, or skincare and your selections will appear here with a cleaner ecommerce summary.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
          >
            Continue shopping
          </Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            {cart.map((item) => (
              <article
                key={item.id}
                className="grid gap-5 rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[0_18px_44px_rgba(17,17,17,0.05)] sm:grid-cols-[120px_1fr_auto]"
              >
                <div className="overflow-hidden rounded-[1.5rem] bg-[var(--card-tint)]">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-32 w-full object-cover sm:h-full" />
                  ) : (
                    <div className="flex h-32 items-center justify-center text-sm text-[var(--muted)]">No image</div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Cart item</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{item.name}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">Unit price: {formatPrice(item.price)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--card-tint)] p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={checkoutLoading}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold text-[var(--foreground)]"
                      >
                        -
                      </button>
                      <span className="min-w-12 px-4 text-center text-sm font-semibold text-[var(--foreground)]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={checkoutLoading}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold text-[var(--foreground)]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={checkoutLoading}
                      className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-3 sm:items-end">
                  <p className="rounded-full bg-[var(--card-tint)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    In stock
                  </p>
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Checkout</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Complete your order</h2>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-[var(--foreground)]">
                Name
                <input
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer((current) => ({ ...current, name: e.target.value }))}
                  disabled={checkoutLoading}
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                  placeholder="Your full name"
                />
              </label>

              <label className="block text-sm font-semibold text-[var(--foreground)]">
                Phone
                <input
                  type="tel"
                  required
                  minLength={MIN_PHONE_DIGITS}
                  value={customer.phone}
                  onChange={(e) => setCustomer((current) => ({ ...current, phone: e.target.value }))}
                  disabled={checkoutLoading}
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                  placeholder="03xxxxxxxxx"
                />
              </label>

              <label className="block text-sm font-semibold text-[var(--foreground)]">
                Email
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer((current) => ({ ...current, email: e.target.value }))}
                  disabled={checkoutLoading}
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-sm font-semibold text-[var(--foreground)]">
                Address
                <textarea
                  required
                  value={customer.address}
                  onChange={(e) => setCustomer((current) => ({ ...current, address: e.target.value }))}
                  disabled={checkoutLoading}
                  className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                  placeholder="Street, city, zip"
                  rows={4}
                />
              </label>
            </div>

            <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--foreground)]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-[var(--foreground)]">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold text-[var(--foreground)]">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-4 text-base font-semibold text-[var(--foreground)]">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full rounded-full bg-[var(--foreground)] py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading ? "Finalizing your checkout..." : "Checkout"}
              </button>
              <button
                onClick={clearCart}
                disabled={checkoutLoading}
                className="w-full rounded-full border border-[var(--border-strong)] py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
              >
                Clear cart
              </button>
            </div>

            {checkoutError && (
              <p className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{checkoutError}</p>
            )}

            <div className="mt-6 rounded-[1.5rem] bg-[var(--card-tint)] p-4 text-sm leading-6 text-[var(--muted)]">
              Free delivery unlocks at Rs 50. After checkout, the cart clears and you return to the homepage with a success state.
            </div>
          </aside>
        </section>
      )}
      </div>
    </>
  );
}
