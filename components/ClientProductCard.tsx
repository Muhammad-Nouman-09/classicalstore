"use client";

import Link from "next/link";
import AddToCartButton from "@/app/products/[id]/AddToCartButton";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function ClientProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-[0_18px_44px_rgba(17,17,17,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(17,17,17,0.1)]">
      <Link href={`/products/${product.id}`} className="relative block overflow-hidden bg-[var(--card-tint)]">
        <span className="absolute left-4 top-4 z-10 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Featured
        </span>
        <div className="aspect-[4/5] overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">No image</div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/products/${product.id}`} className="space-y-2">
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{product.name}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">
            {product.description || "A polished store essential for effortless everyday styling."}
          </p>
        </Link>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Price</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              {formatPrice(product.price)}
            </p>
          </div>
          <p className="rounded-full bg-[var(--card-tint)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            In stock
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <AddToCartButton product={product} />
          <Link
            href={`/products/${product.id}#order-form`}
            className="flex-1 rounded-full border border-[var(--border-strong)] px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
          >
            Buy now
          </Link>
        </div>
      </div>
    </article>
  );
}
