import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ClientProductCard from "@/components/ClientProductCard";

export const revalidate = 0; // refresh product list every minute

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
};

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, image, description")
    .order("name");

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  return data ?? [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-sm text-gray-400">
          Browse everything we have in stock. Prices shown in your store currency.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ClientProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No products available. Add products in Supabase to display them here.
        </p>
      )}
    </div>
  );
}
