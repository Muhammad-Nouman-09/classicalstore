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
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('productId', productId);
        formData.append('quantity', quantity.toString());
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
      className="rounded-lg border border-gray-800 bg-black/40 p-6 space-y-4"
    >
      <div>
        <h2 className="text-2xl font-semibold">Order {productName}</h2>
        <p className="text-sm text-gray-400">We’ll confirm by phone before shipping.</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-200">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-black/30 p-2 text-white"
            placeholder="Your full name"
          />
        </label>

        <label className="block text-sm font-medium text-gray-200">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-black/30 p-2 text-white"
            placeholder="+1 555 123 4567"
          />
        </label>

        <label className="block text-sm font-medium text-gray-200">
          Address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-black/30 p-2 text-white"
            rows={3}
            placeholder="Street, city, postal code"
          />
        </label>

        <label className="block text-sm font-medium text-gray-200">
          Quantity
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-24 rounded-md border border-gray-700 bg-black/30 p-2 text-white"
          />
        </label>
      </div>

      <div className="rounded-md border border-gray-800 bg-black/30 p-3 text-sm text-gray-200 space-y-1">
        <div className="flex justify-between">
          <span>Item</span>
          <span>{productName}</span>
        </div>
        <div className="flex justify-between">
          <span>Unit price</span>
          <span>${price}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Order total</span>
          <span>${total}</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full rounded-md bg-white px-4 py-2 font-semibold text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Placing order..." : "Place order"}
      </button>

      {message && <p className="text-sm text-green-400">{message}</p>}
    </div>
  );
}
