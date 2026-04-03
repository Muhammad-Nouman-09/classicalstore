"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCategoryDirectory } from "@/lib/categorySystem";
import { formatPrice } from "@/lib/productUtils";

type ProductCategoryRecord = {
  id?: string;
  name?: string;
  price?: number;
  category?: string | null;
  subcategory?: string | null;
  image?: string | null;
  description?: string | null;
  in_stock?: boolean | null;
  featured?: boolean | null;
};

type ProductFormData = {
  name: string;
  price: string;
  category: string;
  subcategory: string;
  inStock: boolean;
  featured: boolean;
  image: string;
  description: string;
};

type AddProductFormProps = {
  existingProducts?: ProductCategoryRecord[];
  onProductAdded?: (product: ProductCategoryRecord) => void;
  onProductUpdated?: (product: ProductCategoryRecord) => void;
  onProductDeleted?: (productId: string) => void;
};

const emptyFormData: ProductFormData = {
  name: "",
  price: "",
  category: "",
  subcategory: "",
  inStock: true,
  featured: false,
  image: "",
  description: "",
};

export default function AddProductForm({
  existingProducts = [],
  onProductAdded,
  onProductUpdated,
  onProductDeleted,
}: AddProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({ ...emptyFormData });
  const [loading, setLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [useCustomSubcategory, setUseCustomSubcategory] = useState(false);

  const categoryDirectory = useMemo(() => buildCategoryDirectory(existingProducts), [existingProducts]);
  const categoryOptions = categoryDirectory.map((entry) => entry.name);
  const subcategoryOptions =
    categoryDirectory.find((entry) => entry.name.toLowerCase() === formData.category.trim().toLowerCase())?.subcategories ?? [];
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const filteredProducts = existingProducts.filter((product) => {
    const matchesSearch = normalizedProductSearch
      ? [product.name ?? "", product.category ?? "", product.subcategory ?? "", product.description ?? ""].some((value) =>
          value.toLowerCase().includes(normalizedProductSearch)
        )
      : true;
    const matchesCategory = productCategoryFilter
      ? (product.category ?? "").trim().toLowerCase() === productCategoryFilter.toLowerCase()
      : true;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (!editingProductId) return;

    const productStillExists = existingProducts.some((product) => product.id === editingProductId);
    if (!productStillExists) {
      setEditingProductId(null);
      setFormData({ ...emptyFormData });
    }
  }, [editingProductId, existingProducts]);

  const resetForm = () => {
    setFormData({ ...emptyFormData });
    setEditingProductId(null);
    setUseCustomCategory(false);
    setUseCustomSubcategory(false);
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

  const startEditing = (product: ProductCategoryRecord) => {
    const category = product.category ?? "";
    const subcategory = product.subcategory ?? "";
    const hasKnownCategory = categoryOptions.some((option) => option.toLowerCase() === category.trim().toLowerCase());
    const knownSubcategories =
      categoryDirectory.find((entry) => entry.name.toLowerCase() === category.trim().toLowerCase())?.subcategories ?? [];
    const hasKnownSubcategory = knownSubcategories.some((option) => option.toLowerCase() === subcategory.trim().toLowerCase());

    setEditingProductId(product.id ?? null);
    setFormData({
      name: product.name ?? "",
      price: typeof product.price === "number" ? String(product.price) : "",
      category,
      subcategory,
      inStock: product.in_stock ?? true,
      featured: product.featured ?? false,
      image: product.image ?? "",
      description: product.description ?? "",
    });
    setUseCustomCategory(Boolean(category) && !hasKnownCategory);
    setUseCustomSubcategory(Boolean(subcategory) && !hasKnownSubcategory);
    setMessage(null);
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
      const payload = {
        name: formData.name.trim(),
        price,
        category: category || null,
        subcategory: subcategory || null,
        inStock: formData.inStock,
        featured: formData.featured,
        image: formData.image.trim() || null,
        description: formData.description.trim() || null,
      };

      const response = await fetch(editingProductId ? `/api/products/${editingProductId}` : "/api/products", {
        method: editingProductId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingProductId ? "update" : "add"} product.`);
      }

      const data = await response.json();
      if (editingProductId) {
        setMessage({ type: "success", text: "Product updated successfully." });
        onProductUpdated?.(data.product);
      } else {
        setMessage({ type: "success", text: "Product added successfully." });
        onProductAdded?.(data.product);
      }
      resetForm();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : `Failed to ${editingProductId ? "update" : "add"} product.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: ProductCategoryRecord) => {
    if (!product.id || deletingProductId) return;

    const confirmed = window.confirm(`Delete "${product.name ?? "this product"}"?`);
    if (!confirmed) return;

    setDeletingProductId(product.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product.");
      }

      if (editingProductId === product.id) {
        resetForm();
      }

      onProductDeleted?.(product.id);
      setMessage({ type: "success", text: "Product deleted successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete product.",
      });
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Product entry</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            {editingProductId ? "Edit product" : "Add new product"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Use the same cleaner storefront system when adding catalog items, so admin tools feel aligned with the
            customer-facing shop.
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
                >
                  <option value="">Select category</option>
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
                  disabled={!formData.category.trim()}
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

            <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">Homepage spotlight</p>
              <label className="mt-3 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(formData.featured)}
                  onChange={(event) => setFormData((prev) => ({ ...prev, featured: event.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-[var(--border-strong)] text-[var(--foreground)] focus:ring-[var(--foreground)]"
                />
                <span className="text-sm leading-6 text-[var(--muted)]">
                  Mark this product as featured/best seller so it can appear in the homepage spotlight section.
                </span>
              </label>
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

          <div className="flex flex-wrap justify-end gap-3">
            {editingProductId ? (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMessage(null);
                }}
                className="rounded-full border border-[var(--border-strong)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
              >
                Cancel edit
              </button>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (editingProductId ? "Updating product..." : "Adding product...") : editingProductId ? "Update product" : "Add product"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Saved products</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              Manage your catalog
            </h3>
          </div>
          <span className="rounded-full bg-[var(--card-tint)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
            {existingProducts.length} products
          </span>
        </div>

        <div className="mb-6 grid gap-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-4 md:grid-cols-[minmax(0,1.3fr)_220px]">
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Search products
            <input
              type="text"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search by name, category, or description"
              className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            />
          </label>

          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Filter by category
            <select
              value={productCategoryFilter}
              onChange={(event) => setProductCategoryFilter(event.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        {existingProducts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[var(--card-tint)] px-5 py-8 text-center text-sm text-[var(--muted)]">
            No products added yet.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[var(--card-tint)] px-5 py-8 text-center text-sm text-[var(--muted)]">
            No saved products matched your current search or category filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const isDeleting = deletingProductId === product.id;
              const isEditing = editingProductId === product.id;

              return (
                <article
                  key={product.id ?? product.name}
                  className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-xl font-semibold text-[var(--foreground)]">{product.name ?? "Untitled product"}</h4>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
                          {formatPrice(product.price ?? 0)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                            product.in_stock === false ? "bg-[#fdecec] text-[#9b2c2c]" : "bg-[#edf9ea] text-[#2d6b2d]"
                          }`}
                        >
                          {product.in_stock === false ? "Out of stock" : "In stock"}
                        </span>
                        {product.featured ? (
                          <span className="rounded-full bg-[#fff2df] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#a14f20]">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                        <span>Category: {product.category?.trim() || "Uncategorized"}</span>
                        <span>Subcategory: {product.subcategory?.trim() || "None"}</span>
                      </div>
                      {product.description ? (
                        <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">{product.description}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEditing(product)}
                        className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                          isEditing
                            ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                            : "border-[var(--border-strong)] text-[var(--foreground)] hover:border-[var(--foreground)]"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product)}
                        disabled={isDeleting}
                        className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
