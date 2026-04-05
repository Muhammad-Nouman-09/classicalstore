"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderProcessingModal from "@/components/OrderProcessingModal";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/productUtils";
import { isValidEmail, isValidPhone, MIN_PHONE_DIGITS } from "@/lib/orderValidation";

type OrderFormProps = {
  productId: string;
  productName: string;
  price: number;
};

export default function OrderForm({ productId, productName, price }: OrderFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;
      setUserId(user?.id ?? null);
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    setMessage(null);

    if (!name.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      setMessage("Please fill in your name, phone, email, and address.");
      return;
    }

    if (!isValidPhone(phone)) {
      setMessage(`Phone number must contain at least ${MIN_PHONE_DIGITS} digits.`);
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          productId,
          quantity,
          userId,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to place order.");
      }

      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setQuantity(1);
      const params = new URLSearchParams({ order: "success" });
      if (userId) {
        params.set("rate", productId);
      }
      router.push(`/?${params.toString()}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to place order.");
    } finally {
      setIsPending(false);
    }
  };

  const total = price * quantity;

  return (
    <>
      {isPending ? (
        <OrderProcessingModal
          badge="Securing your order"
          title="We are placing your order"
          description="Please keep this page open for a moment while we save your details and prepare your confirmation."
        />
      ) : null}

      <div
        id="order-form"
        aria-busy={isPending}
        className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.06)]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Buy now</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Order {productName}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Complete the form below and we&apos;ll place your order, then return you to the homepage after success.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <span className="rounded-[1rem] bg-[var(--card-tint)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
            Unit price: {formatPrice(price)}
          </span>
          <span className="rounded-[1rem] bg-[var(--card-tint)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
            Order total: {formatPrice(total)}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
              className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
              placeholder="03xxxxxxxxx"
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Address
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isPending}
              className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
              placeholder="Street, city, zip"
              rows={4}
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Quantity
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              disabled={isPending}
              className="mt-2 w-28 rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Finalizing your order..." : "Place order"}
        </button>

        {message && (
          <p className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p>
        )}
      </div>
    </>
  );
}
