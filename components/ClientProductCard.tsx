"use client";

import Link from "next/link";
import AddToCartButton from "@/app/products/[id]/AddToCartButton";
import { formatPrice, getRatingStars, normalizeProduct } from "@/lib/productUtils";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
  rating?: number | null;
  rating_count?: number | null;
  in_stock?: boolean | null;
};

export default function ClientProductCard({ product }: { product: Product }) {
  const normalizedProduct = normalizeProduct(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-[0_18px_44px_rgba(17,17,17,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(17,17,17,0.1)]">
      <Link href={`/products/${normalizedProduct.id}`} className="relative block overflow-hidden bg-[var(--card-tint)]">
        <span className="absolute left-4 top-4 z-10 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Featured
        </span>
        <div className="aspect-[4/5] overflow-hidden">
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

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/products/${normalizedProduct.id}`} className="space-y-2">
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{normalizedProduct.name}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">
            {normalizedProduct.description || "A polished store essential for effortless everyday styling."}
          </p>
        </Link>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Rating</p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
              {getRatingStars(normalizedProduct.rating)} <span className="ml-1">{normalizedProduct.rating.toFixed(1)}</span>
              <span className="ml-2 text-[var(--muted)]">({normalizedProduct.rating_count})</span>
            </p>
          </div>
          <p
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
              normalizedProduct.in_stock
                ? "bg-[var(--card-tint)] text-[var(--muted)]"
                : "bg-red-50 text-red-700"
            }`}
          >
            {normalizedProduct.in_stock ? "In stock" : "Out of stock"}
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Price</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              {formatPrice(normalizedProduct.price)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <AddToCartButton product={normalizedProduct} disabled={!normalizedProduct.in_stock} />
          <Link
            href={normalizedProduct.in_stock ? `/products/${normalizedProduct.id}#order-form` : `/products/${normalizedProduct.id}`}
            className={`flex-1 rounded-full border px-4 py-3 text-center text-sm font-semibold transition ${
              normalizedProduct.in_stock
                ? "border-[var(--border-strong)] text-[var(--foreground)] hover:border-[var(--foreground)]"
                : "cursor-not-allowed border-[var(--border)] text-[var(--muted)]"
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
        </div>
      </div>
    </article>
  );
}
