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
    <div className="flex flex-col h-full rounded-lg border border-gray-800 bg-black/40 p-4 transition hover:border-gray-200 hover:bg-black/30">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="group block mb-4">
        <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-900">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <Link href={`/products/${product.id}`} className="flex-1 mb-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold hover:text-gray-300 transition">{product.name}</h2>
          <p className="text-gray-400 line-clamp-2">{product.description}</p>
          <p className="text-xl font-bold">${product.price}</p>
        </div>
      </Link>

      {/* Buttons */}
      <div className="flex gap-2">
        <AddToCartButton product={product} />
        <Link
          href={`/products/${product.id}`}
          className="flex-1 rounded-md bg-white text-black px-3 py-2 text-sm font-semibold text-center transition hover:bg-gray-100"
        >
          Buy now
        </Link>
      </div>
    </div>
  );
}
