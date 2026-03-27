import { supabase } from "@/lib/supabase";
import ClientProductCard from "@/components/ClientProductCard";

export const revalidate = 0;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
  category?: string | null;
};

async function getProducts(): Promise<Product[]> {
  const primary = await supabase
    .from("products")
    .select("id, name, price, image, description, category")
    .order("name");

  if (!primary.error) {
    return primary.data ?? [];
  }

  if (primary.error?.message?.toLowerCase().includes('category')) {
    const fallback = await supabase
      .from("products")
      .select("id, name, price, image, description")
      .order("name");
    if (!fallback.error) return fallback.data ?? [];
    throw new Error(`Failed to load products (fallback): ${fallback.error.message}`);
  }

  throw new Error(`Failed to load products: ${primary.error.message}`);
}

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c))
    )
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-fuchsia-500/10 via-orange-400/10 to-purple-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.2),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.16),transparent_35%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-700 shadow-sm backdrop-blur">
            Catalog
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl">Shop the collection</h1>
              <p className="max-w-2xl text-slate-700">Bold fits, tactile textures, and curated essentials to pair with the homepage vibe. Everything updates live from Supabase.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              <span className="pill">Free shipping $50+</span>
              <span className="pill">24h dispatch</span>
              <span className="pill">Rewards ready</span>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ClientProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <p className="rounded-2xl border border-slate-100 bg-white/90 p-8 text-center text-slate-700 shadow-sm">
            No products available. Add products in Supabase to display them here.
          </p>
        )}
      </section>
    </div>
  );
}
