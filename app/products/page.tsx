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

  if (primary.error?.message?.toLowerCase().includes("category")) {
    const fallback = await supabase.from("products").select("id, name, price, image, description").order("name");
    if (!fallback.error) return fallback.data ?? [];
    throw new Error(`Failed to load products (fallback): ${fallback.error.message}`);
  }

  throw new Error(`Failed to load products: ${primary.error.message}`);
}

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const searchQuery = resolvedSearchParams.q?.trim() ?? "";
  const products = await getProducts();
  const normalizedQuery = searchQuery.toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((product) =>
        [product.name, product.description ?? "", product.category ?? ""].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      )
    : products;
  const categories = Array.from(
    new Set(
      filteredProducts.map((product) => product.category?.trim()).filter((category): category is string => Boolean(category))
    )
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <section className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(244,239,229,0.95),rgba(255,255,255,0.96))] px-6 py-10 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Catalog</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
              Shop the collection
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              A cleaner storefront for fashion, accessories, beauty, and skincare. Clear product cards, clear prices,
              and faster paths to cart.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Free delivery $50+
            </span>
            <span className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Fast dispatch
            </span>
            <span className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Secure checkout
            </span>
          </div>
        </div>

        {searchQuery ? (
          <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white px-4 py-4 text-sm text-[var(--muted)]">
            Showing results for <span className="font-semibold text-[var(--foreground)]">&quot;{searchQuery}&quot;</span>
          </div>
        ) : null}

        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-[var(--border)] bg-[var(--card-tint)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ClientProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="rounded-[2rem] border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)] shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
            {searchQuery
              ? `No products matched "${searchQuery}". Try a different keyword.`
              : "No products available yet. Add products in Supabase to populate the storefront."}
          </p>
        )}
      </section>
    </div>
  );
}
