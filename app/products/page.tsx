import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ClientProductCard from "@/components/ClientProductCard";
import { buildCategoryDirectory, buildProductsFilterHref, findCategoryEntry, findSubcategoryName } from "@/lib/categorySystem";
import { mergeProductRatings } from "@/lib/productUtils";

export const revalidate = 0;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
  category?: string | null;
  subcategory?: string | null;
  created_at?: string | null;
  rating?: number | null;
  rating_count?: number | null;
  in_stock?: boolean | null;
};

async function getProducts(): Promise<Product[]> {
  const primary = await supabase
    .from("products")
    .select("id, name, price, image, description, category, subcategory, created_at, rating, in_stock")
    .order("created_at", { ascending: false, nullsFirst: false });

  if (!primary.error) {
    const { data: ratingRows } = await supabase.from("product_ratings").select("product_id, rating");
    return mergeProductRatings(primary.data ?? [], ratingRows ?? []);
  }

  if (
    primary.error?.message?.toLowerCase().includes("category") ||
    primary.error?.message?.toLowerCase().includes("rating") ||
    primary.error?.message?.toLowerCase().includes("in_stock")
  ) {
    const fallback = await supabase
      .from("products")
      .select("id, name, price, image, description, category, subcategory, created_at")
      .order("created_at", { ascending: false, nullsFirst: false });
    if (!fallback.error) {
      const { data: ratingRows } = await supabase.from("product_ratings").select("product_id, rating");
      return mergeProductRatings(fallback.data ?? [], ratingRows ?? []);
    }
    throw new Error(`Failed to load products (fallback): ${fallback.error.message}`);
  }

  throw new Error(`Failed to load products: ${primary.error.message}`);
}

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const searchQuery = resolvedSearchParams.q?.trim() ?? "";
  const selectedCategory = resolvedSearchParams.category?.trim() ?? "";
  const selectedSubcategory = resolvedSearchParams.subcategory?.trim() ?? "";
  const products = await getProducts();
  const normalizedQuery = searchQuery.toLowerCase();
  const categoryDirectory = buildCategoryDirectory(products);
  const matchedCategory = findCategoryEntry(categoryDirectory, selectedCategory)?.name ?? "";
  const matchedSubcategory = findSubcategoryName(categoryDirectory, matchedCategory, selectedSubcategory);
  const filteredProducts = products.filter((product) => {
    const matchesQuery = normalizedQuery
      ? [product.name, product.description ?? "", product.category ?? "", product.subcategory ?? ""].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      : true;
    const matchesCategory = matchedCategory
      ? product.category?.trim().toLowerCase() === matchedCategory.toLowerCase()
      : true;
    const matchesSubcategory = matchedSubcategory
      ? product.subcategory?.trim().toLowerCase() === matchedSubcategory.toLowerCase()
      : true;

    return matchesQuery && matchesCategory && matchesSubcategory;
  });
  const activeCategoryEntry = findCategoryEntry(categoryDirectory, matchedCategory);

  return (
    <div className="mx-auto min-w-[320px] max-w-6xl px-2 py-8 md:px-4">
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
              Free delivery Rs 2000+
            </span>
            <span className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Secure checkout
            </span>
            <span className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Cash on Delivery
            </span>
            <span className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Quality products
            </span>
          </div>
        </div>

        {searchQuery || matchedCategory || matchedSubcategory ? (
          <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white px-4 py-4 text-sm text-[var(--muted)]">
            {searchQuery ? (
              <>
                Showing results for <span className="font-semibold text-[var(--foreground)]">&quot;{searchQuery}&quot;</span>
              </>
            ) : (
              <>Browsing all products</>
            )}
            {matchedCategory ? (
              <>
                {" "}
                in <span className="font-semibold text-[var(--foreground)]">{matchedCategory}</span>
              </>
            ) : null}
            {matchedSubcategory ? (
              <>
                {" "}
                / <span className="font-semibold text-[var(--foreground)]">{matchedSubcategory}</span>
              </>
            ) : null}
          </div>
        ) : null}

        {categoryDirectory.length > 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Filter</p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">Filter by category</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildProductsFilterHref({ query: searchQuery })}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    !matchedCategory
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                      : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--foreground)]"
                  }`}
                >
                  All
                </Link>
                {categoryDirectory.map((category) => (
                  <Link
                    key={category.name}
                    href={buildProductsFilterHref({ query: searchQuery, category: category.name })}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      matchedCategory.toLowerCase() === category.name.toLowerCase()
                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                        : "border-[var(--border)] bg-[var(--card-tint)] text-[var(--foreground)] hover:border-[var(--foreground)]"
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {activeCategoryEntry && activeCategoryEntry.subcategories.length > 0 && (
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Subcategory</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">Drill into {activeCategoryEntry.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={buildProductsFilterHref({ query: searchQuery, category: activeCategoryEntry.name })}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        !matchedSubcategory
                          ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                          : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--foreground)]"
                      }`}
                    >
                      All {activeCategoryEntry.name}
                    </Link>
                    {activeCategoryEntry.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory}
                        href={buildProductsFilterHref({
                          query: searchQuery,
                          category: activeCategoryEntry.name,
                          subcategory,
                        })}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          matchedSubcategory.toLowerCase() === subcategory.toLowerCase()
                            ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--foreground)]"
                        }`}
                      >
                        {subcategory}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(17,17,17,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Sort</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Newest products first</p>
          </div>
          <span className="rounded-full bg-[var(--card-tint)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
            {filteredProducts.length} products
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ClientProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="rounded-[2rem] border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)] shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
            {searchQuery || matchedCategory
              ? `No products matched${searchQuery ? ` "${searchQuery}"` : ""}${matchedCategory ? ` in ${matchedCategory}` : ""}${matchedSubcategory ? ` / ${matchedSubcategory}` : ""}. Try a different filter.`
              : "No products available yet. Add products in Supabase to populate the storefront."}
          </p>
        )}
      </section>
    </div>
  );
}
