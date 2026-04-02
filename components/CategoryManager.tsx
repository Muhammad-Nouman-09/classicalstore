"use client";

import Link from "next/link";
import { buildCategoryDirectory, buildProductsFilterHref } from "@/lib/categorySystem";

type Product = {
  id: string;
  name: string;
  category?: string | null;
  subcategory?: string | null;
};

export default function CategoryManager({ products }: { products: Product[] }) {
  const directory = buildCategoryDirectory(products);
  const categorizedProducts = products.filter((product) => product.category?.trim());
  const uncategorizedProducts = products.filter((product) => !product.category?.trim());
  const totalSubcategories = directory.reduce((sum, category) => sum + category.subcategories.length, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Category groups</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{directory.length}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Shared departments available to the add-product flow and storefront filters.
          </p>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Linked products</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{categorizedProducts.length}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Products already connected to a category and ready to show on product-card badges.
          </p>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[0_18px_40px_rgba(17,17,17,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Subcategories</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{totalSubcategories}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Granular filters that can be assigned in admin and browsed from the catalog page.
          </p>
        </article>
      </section>

      {uncategorizedProducts.length > 0 && (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Needs attention</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-amber-950">Products without a category</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900/80">
                These items won&apos;t appear under a department badge until they&apos;re assigned a category in the product form.
              </p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-950 shadow-sm">
              {uncategorizedProducts.length} uncategorized
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {uncategorizedProducts.map((product) => (
              <span
                key={product.id}
                className="rounded-full border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-950"
              >
                {product.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        {directory.map((category) => {
          const categoryProducts = products.filter(
            (product) => product.category?.trim().toLowerCase() === category.name.toLowerCase()
          );

          return (
            <article
              key={category.name}
              className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-[0_18px_44px_rgba(17,17,17,0.05)]"
            >
              <div className="border-b border-[var(--border)] bg-[var(--card-tint)] p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Department</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{category.name}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">{category.subtitle}</p>
                  </div>
                  <Link
                    href={buildProductsFilterHref({ category: category.name })}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
                  >
                    View storefront
                  </Link>
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-[var(--card-tint)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                    {category.productCount} products
                  </span>
                  <span className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">
                    {category.subcategories.length} subcategories
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Subcategory map</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {category.subcategories.length > 0 ? (
                      category.subcategories.map((subcategory) => (
                        <Link
                          key={`${category.name}-${subcategory}`}
                          href={buildProductsFilterHref({ category: category.name, subcategory })}
                          className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--foreground)]"
                        >
                          {subcategory}
                        </Link>
                      ))
                    ) : (
                      <span className="text-sm text-[var(--muted)]">No subcategories assigned yet.</span>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Products in this category</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categoryProducts.length > 0 ? (
                      categoryProducts.map((product) => (
                        <span
                          key={product.id}
                          className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
                        >
                          {product.name}
                          {product.subcategory?.trim() ? ` • ${product.subcategory.trim()}` : ""}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[var(--muted)]">No products assigned yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
