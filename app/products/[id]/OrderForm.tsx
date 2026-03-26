"use client";

import { useState, useTransition } from "react";
import { submitOrder } from "./actions";

type OrderFormProps = {
  productId: string;
  productName: string;
  price: number;
};

export default function OrderForm({ productId, productName, price }: OrderFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("productId", productId);
        formData.append("quantity", quantity.toString());
        await submitOrder(formData);
        setMessage("Order placed! We'll reach out soon to confirm.");
        setName("");
        setPhone("");
        setAddress("");
        setQuantity(1);
      } catch (error) {
        setMessage((error as Error).message);
      }
    });
  };

  const total = price * quantity;

  return (
    <div
      id="order-form"
      className="space-y-4 rounded-lg border border-emerald-100 bg-white/90 p-6 shadow-sm shadow-emerald-50"
    >
      <div>
        <h2 className="text-2xl font-semibold text-emerald-900">Order {productName}</h2>
        <p className="text-sm text-emerald-700">We'll confirm by phone before shipping.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-emerald-800">
        <span className="rounded-md bg-emerald-50 px-3 py-2">Unit: ${price.toFixed(2)}</span>
        <span className="rounded-md bg-emerald-50 px-3 py-2">Total: ${total.toFixed(2)}</span>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-emerald-800">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-emerald-900 placeholder-emerald-400 focus:border-emerald-400 focus:outline-none"
            placeholder="Your full name"
          />
        </label>

        <label className="block text-sm font-medium text-emerald-800">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-emerald-900 placeholder-emerald-400 focus:border-emerald-400 focus:outline-none"
            placeholder="+1 555 123 4567"
          />
        </label>

        <label className="block text-sm font-medium text-emerald-800">
          Address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-emerald-900 placeholder-emerald-400 focus:border-emerald-400 focus:outline-none"
            placeholder="Street, city, zip"
          />
        </label>

        <label className="block text-sm font-medium text-emerald-800">
          Quantity
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-24 rounded-md border border-emerald-200 bg-white px-3 py-2 text-emerald-900 focus:border-emerald-400 focus:outline-none"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-60"
      >
        {isPending ? "Placing order..." : "Place order"}
      </button>

      {message && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
    </div>
  );
}
