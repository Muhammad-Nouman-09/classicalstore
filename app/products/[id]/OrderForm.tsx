"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderFormProps = {
  productId: string;
  productName: string;
  price: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function OrderForm({ productId, productName, price }: OrderFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setMessage(null);
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
          address: address.trim(),
          productId,
          quantity,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to place order.");
      }

      setName("");
      setPhone("");
      setAddress("");
      setQuantity(1);
      router.push("/?order=success");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to place order.");
    } finally {
      setIsPending(false);
    }
  };

  const total = price * quantity;

  return (
    <div
      id="order-form"
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            placeholder="Your full name"
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--foreground)]">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            placeholder="+1 555 123 4567"
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--foreground)]">
          Address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
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
        {isPending ? "Placing order..." : "Place order"}
      </button>

      {message && (
        <p className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p>
      )}
    </div>
  );
}
