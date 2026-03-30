"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CategoryRow = {
  category: string | null;
  subcategory: string | null;
};

function sortUnique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    subcategory: "",
    inStock: true,
    image: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [useCustomSubcategory, setUseCustomSubcategory] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [subcategoryMap, setSubcategoryMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let isMounted = true;

    const loadCategoryOptions = async () => {
      setOptionsLoading(true);

      const { data, error } = await supabase.from("products").select("category, subcategory");

      if (!isMounted) return;

      if (error) {
        setOptionsLoading(false);
        return;
      }

      const rows = (data ?? []) as CategoryRow[];
      const categories = sortUnique(rows.map((row) => row.category ?? ""));
      const nextSubcategoryMap = rows.reduce<Record<string, string[]>>((acc, row) => {
        const category = row.category?.trim();
        const subcategory = row.subcategory?.trim();

        if (!category) {
          return acc;
        }

        if (!acc[category]) {
          acc[category] = [];
        }

        if (subcategory) {
          acc[category].push(subcategory);
        }

        return acc;
      }, {});

      for (const key of Object.keys(nextSubcategoryMap)) {
        nextSubcategoryMap[key] = sortUnique(nextSubcategoryMap[key]);
      }

      setCategoryOptions(categories);
      setSubcategoryMap(nextSubcategoryMap);
      setOptionsLoading(false);
    };

    void loadCategoryOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const subcategoryOptions = formData.category ? subcategoryMap[formData.category] ?? [] : [];

  const updateCategoryOptions = (category: string, subcategory: string) => {
    if (!category) return;

    setCategoryOptions((current) => sortUnique([...current, category]));
    setSubcategoryMap((current) => {
      const existing = current[category] ?? [];
      return {
        ...current,
        [category]: subcategory ? sortUnique([...existing, subcategory]) : existing,
      };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
      subcategory: "",
    }));
    setUseCustomSubcategory(false);
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

      const category = formData.category.trim();
      const subcategory = formData.subcategory.trim();

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          price,
          category: category || null,
          subcategory: subcategory || null,
          inStock: formData.inStock,
          image: formData.image.trim() || null,
          description: formData.description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add product.");
      }

      updateCategoryOptions(category, subcategory);
      setMessage({ type: "success", text: "Product added successfully." });
      setFormData({
        name: "",
        price: "",
        category: "",
        subcategory: "",
        inStock: true,
        image: "",
        description: "",
      });
      setUseCustomCategory(false);
      setUseCustomSubcategory(false);
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
            Price (Rs)
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

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="category" className="block text-sm font-semibold text-[var(--foreground)]">
                Category
              </label>
              <button
                type="button"
                onClick={() => {
                  setUseCustomCategory((current) => !current);
                  setFormData((prev) => ({ ...prev, category: "", subcategory: "" }));
                  setUseCustomSubcategory(false);
                }}
                className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
              >
                + New category
              </button>
            </div>

            {useCustomCategory ? (
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                placeholder="Clothes"
              />
            ) : (
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={(event) => handleCategoryChange(event.target.value)}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                disabled={optionsLoading}
              >
                <option value="">{optionsLoading ? "Loading categories..." : "Select category"}</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="subcategory" className="block text-sm font-semibold text-[var(--foreground)]">
                Subcategory
              </label>
              <button
                type="button"
                onClick={() => {
                  setUseCustomSubcategory((current) => !current);
                  setFormData((prev) => ({ ...prev, subcategory: "" }));
                }}
                className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
                disabled={!formData.category.trim()}
              >
                + New subcategory
              </button>
            </div>

            {useCustomSubcategory || useCustomCategory ? (
              <input
                type="text"
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                placeholder="Summer wear"
                disabled={!formData.category.trim()}
              />
            ) : (
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                disabled={!formData.category.trim() || optionsLoading}
              >
                <option value="">
                  {!formData.category.trim()
                    ? "Select category first"
                    : subcategoryOptions.length > 0
                      ? "Select subcategory"
                      : "No subcategories yet"}
                </option>
                {subcategoryOptions.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Stock status</p>
            <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--background)] p-1">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, inStock: true }))}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  formData.inStock ? "bg-[var(--foreground)] text-white" : "text-[var(--foreground)]"
                }`}
              >
                In stock
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, inStock: false }))}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !formData.inStock ? "bg-[var(--foreground)] text-white" : "text-[var(--foreground)]"
                }`}
              >
                Out of stock
              </button>
            </div>
          </div>

          <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">
            Product categories here are shared with the products page filter, so new admin entries become storefront filters too.
          </div>
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
