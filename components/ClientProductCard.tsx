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

export default function ClientProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-fuchsia-200 hover:shadow-[0_20px_60px_rgba(236,72,153,0.16)]">
      <div className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-fuchsia-600 shadow-sm backdrop-blur">
        New
      </div>
      <Link href={`/products/${product.id}`} className="group/image block mb-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        <div className="aspect-[4/3] overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover/image:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
          )}
        </div>
      </Link>

      <Link href={`/products/${product.id}`} className="flex-1 mb-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-fuchsia-600 transition">{product.name}</h2>
          <p className="text-sm text-slate-600 line-clamp-2">{product.description || "Statement piece for every day."}</p>
          <p className="text-xl font-bold text-slate-900">${product.price}</p>
        </div>
      </Link>

      <div className="flex gap-2">
        <AddToCartButton product={product} />
        <Link
          href={`/products/${product.id}`}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fuchsia-200"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
