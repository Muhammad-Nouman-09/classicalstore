"use client";

import { useState } from "react";

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        throw new Error("Please enter a valid price.");
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: Math.round(price * 100),
          image: formData.image.trim() || null,
          description: formData.description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add product.");
      }

      setMessage({ type: "success", text: "Product added successfully." });
      setFormData({
        name: "",
        price: "",
        image: "",
        description: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add product.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Product entry</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Add new product</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Use the same cleaner storefront system when adding catalog items, so admin tools feel aligned with the customer-facing shop.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-[1rem] border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-[var(--border)] bg-[var(--card-tint)] text-[var(--foreground)]"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
            Product name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
            Price (USD)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
            Image URL
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            placeholder="Enter product description"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Adding product..." : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}
