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
    <div className="flex flex-col h-full rounded-lg border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-50 transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="group block mb-4">
        <div className="aspect-[4/3] overflow-hidden rounded-md border border-emerald-100 bg-emerald-50">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-emerald-500">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <Link href={`/products/${product.id}`} className="flex-1 mb-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-emerald-900 hover:text-emerald-700 transition">
            {product.name}
          </h2>
          <p className="text-emerald-700 line-clamp-2">{product.description}</p>
          <p className="text-xl font-bold text-emerald-900">${product.price}</p>
        </div>
      </Link>

      {/* Buttons */}
      <div className="flex gap-2">
        <AddToCartButton product={product} />
        <Link
          href={`/products/${product.id}`}
          className="flex-1 rounded-md bg-emerald-600 text-white px-3 py-2 text-sm font-semibold text-center transition hover:bg-emerald-500"
        >
          Buy now
        </Link>
      </div>
    </div>
  );
}
