"use client";

import Link from "next/link";
import AddToCartButton from "@/app/products/[id]/AddToCartButton";
import { buildProductsFilterHref } from "@/lib/categorySystem";
import { formatPrice, getRatingStars, normalizeProduct } from "@/lib/productUtils";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
  category?: string | null;
  subcategory?: string | null;
  rating?: number | null;
  rating_count?: number | null;
  in_stock?: boolean | null;
};

export default function ClientProductCard({ product }: { product: Product }) {
  const normalizedProduct = normalizeProduct(product);

  return (
    <article className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-[0_18px_44px_rgba(17,17,17,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(17,17,17,0.1)]">
      <Link href={`/products/${normalizedProduct.id}`} className="relative block overflow-hidden bg-[var(--card-tint)]">
        <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Featured
        </span>
        <div className="aspect-square overflow-hidden">
          {normalizedProduct.image ? (
            <img
              src={normalizedProduct.image}
              alt={normalizedProduct.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">No image</div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {(normalizedProduct.category?.trim() || normalizedProduct.subcategory?.trim()) && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {normalizedProduct.category?.trim() ? (
              <Link
                href={buildProductsFilterHref({ category: normalizedProduct.category })}
                className="rounded-full border border-[var(--border)] bg-[var(--card-tint)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] transition hover:border-[var(--foreground)]"
              >
                {normalizedProduct.category.trim()}
              </Link>
            ) : null}
            {normalizedProduct.category?.trim() && normalizedProduct.subcategory?.trim() ? (
              <Link
                href={buildProductsFilterHref({
                  category: normalizedProduct.category,
                  subcategory: normalizedProduct.subcategory,
                })}
                className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              >
                {normalizedProduct.subcategory.trim()}
              </Link>
            ) : null}
          </div>
        )}

        <Link href={`/products/${normalizedProduct.id}`} className="space-y-1">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-[1.05rem]">
            {normalizedProduct.name}
          </h3>
          <p className="line-clamp-1 text-[13px] leading-5 text-[var(--muted)]">
            {normalizedProduct.description || "A polished store essential for effortless everyday styling."}
          </p>
        </Link>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Rating</p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
              <span className="text-[#c89b2b]">{getRatingStars(normalizedProduct.rating)}</span>
              <span className="ml-1">{normalizedProduct.rating.toFixed(1)}</span>
              <span className="ml-2 text-[var(--muted)]">({normalizedProduct.rating_count})</span>
            </p>
          </div>
          <p
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
              normalizedProduct.in_stock
                ? "bg-[var(--card-tint)] text-[var(--muted)]"
                : "bg-red-50 text-red-700"
            }`}
          >
            {normalizedProduct.in_stock ? "In stock" : "Out of stock"}
          </p>
        </div>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Price</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-[1.35rem]">
              {formatPrice(normalizedProduct.price)}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-1.5">
          <Link
            href={normalizedProduct.in_stock ? `/products/${normalizedProduct.id}#order-form` : `/products/${normalizedProduct.id}`}
            className={`flex items-center justify-center rounded-full px-3 py-2 text-center text-[13px] font-semibold shadow-[0_16px_30px_rgba(180,95,61,0.22)] transition ${
              normalizedProduct.in_stock
                ? "bg-[var(--accent)] text-white hover:-translate-y-0.5 hover:brightness-110"
                : "cursor-not-allowed bg-[var(--border)] text-[var(--muted)] shadow-none"
            }`}
            aria-disabled={!normalizedProduct.in_stock}
            onClick={(event) => {
              if (!normalizedProduct.in_stock) {
                event.preventDefault();
              }
            }}
          >
            {normalizedProduct.in_stock ? "Buy now" : "Unavailable"}
          </Link>
          <AddToCartButton
            product={normalizedProduct}
            disabled={!normalizedProduct.in_stock}
            className="px-3 py-2 text-[13px]"
          />
        </div>
      </div>
    </article>
  );
}
