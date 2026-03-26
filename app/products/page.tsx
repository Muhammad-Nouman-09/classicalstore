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
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Catalog</p>
        <h1 className="text-4xl font-bold text-emerald-900">Browse our products</h1>
        <p className="text-sm text-emerald-700">
          Live inventory from Supabase. Prices shown in your store currency.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ClientProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="rounded-lg border border-emerald-100 bg-white/80 p-6 text-center text-emerald-800">
          No products available. Add products in Supabase to display them here.
        </p>
      )}
    </div>
  );
}
