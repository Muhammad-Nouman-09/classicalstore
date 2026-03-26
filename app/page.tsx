import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

  // If the schema lacks `category`, retry without it so the page still renders.
  if (primary.error?.message?.toLowerCase().includes("category")) {
    const fallback = await supabase.from("products").select("id, name, price, image, description").order("name");
    if (!fallback.error) return fallback.data ?? [];
    console.error("Failed to load products (fallback)", fallback.error);
    return [];
  }

  console.error("Failed to load products", primary.error);
  return [];
}

function priceTag(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default async function Home() {
  const products = await getProducts();

  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c))
    )
  );

  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    const key = p.category?.trim();
    if (!key) return;
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  const featuredProducts = products.slice(0, 6);
  const bestSellers = products.slice(6, 14);
  const everything = products;

  const pill = "rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700";
  const card = "rounded-xl border border-emerald-50 bg-white/90 shadow-sm shadow-emerald-50";

  return (
    <div className="space-y-14 bg-gradient-to-b from-amber-50 via-white to-emerald-50 text-slate-900">
      {/* Utility strip */}
      <div className="border-b border-emerald-100 bg-emerald-50/60 text-sm text-emerald-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <div className="flex flex-wrap gap-4">
            <span className="font-medium">Free delivery over $50</span>
            <span>Daily deals drop at noon</span>
            <span>30-day easy returns</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="underline">Track order</button>
            <button className="underline">Help</button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-2">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online grocery • Open 24/7
          </p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            A vibrant grocery theme for modern shopping
          </h1>
          <p className="text-lg text-slate-700">
            Fresh hero, clear CTAs, and generous breathing room to spotlight your headline categories and offers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-lg bg-emerald-600 px-5 py-3 text-white shadow-lg shadow-emerald-100" href="/products">
              Shop now
            </Link>
            <button className="rounded-lg border border-emerald-200 px-5 py-3 text-emerald-800 hover:bg-emerald-50">
              View weekly deals
            </button>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-emerald-800">
            <span className={pill}>Curated picks</span>
            <span className={pill}>Local & organic</span>
            <span className={pill}>Same-day delivery</span>
          </div>
        </div>
        <div className={`${card} aspect-[4/3] border-dashed border-emerald-300 bg-gradient-to-br from-white to-emerald-100`} aria-hidden>
          <div className="flex h-full items-center justify-center text-sm text-emerald-400">Hero image placeholder</div>
        </div>
      </section>

      {/* Category rail */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-semibold text-emerald-1000">Shop by category</h2>
          <Link className="text-sm text-emerald-600 underline" href="/products">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(categories.length ? categories : ["Essentials", "Snacks", "Fresh", "Pantry"]).map((category) => (
            <div key={category} className={`${card} p-4`}>
              <div className="mb-3 h-14 rounded-md border border-dashed border-emerald-300 bg-emerald-100" aria-hidden />
              <p className="font-semibold text-emerald-900">{category}</p>
              <p className="text-sm text-emerald-700">
                {categoryCounts[category] ? `${categoryCounts[category]} items` : "Curated staples and fresh picks"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Deal of the week + product grid */}
      <section className="mx-auto max-w-6xl space-y-6 px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <div className={`${card} border-2 border-amber-300 p-5 shadow-md shadow-amber-100`}>
            <p className="text-sm uppercase tracking-wide text-amber-600">Deal of the week</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Hero product highlight</h3>
            <div className="mt-4 h-48 rounded-lg border border-dashed border-amber-200 bg-amber-50" aria-hidden />
            <div className="mt-4 flex items-center gap-3 text-sm text-amber-800">
              <span className="rounded-full bg-white px-3 py-1 shadow">00d</span>
              <span className="rounded-full bg-white px-3 py-1 shadow">00h</span>
              <span className="rounded-full bg-white px-3 py-1 shadow">00m</span>
              <span className="rounded-full bg-white px-3 py-1 shadow">00s</span>
            </div>
            <button className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-3 text-white shadow-lg shadow-emerald-100">
              Add to cart
            </button>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-lg font-semibold text-emerald-900">Featured picks</h3>
              <div className="flex gap-2 text-sm">
                <button className="rounded border border-emerald-300 px-3 py-1 text-emerald-800">All</button>
                <button className="rounded border border-emerald-300 px-3 py-1 text-emerald-800">Snacks</button>
                <button className="rounded border border-emerald-300 px-3 py-1 text-emerald-800">Beverages</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {(featuredProducts.length ? featuredProducts : products).slice(0, 6).map((item) => (
                <div key={item.id} className={`${card} p-4`}>
                  <div className="flex items-center justify-between text-xs uppercase text-emerald-800">
                    <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-1">
                      {item.category || "New"}
                    </span>
                    <span className="text-emerald-500">In stock</span>
                  </div>
                  <div className="mt-3 h-28 rounded-md border border-dashed border-emerald-300 bg-emerald-100" aria-hidden />
                  <p className="mt-3 font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{item.description || "Product blurb"}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-emerald-900">{priceTag(item.price)}</span>
                    <a className="rounded border border-emerald-300 px-3 py-1 text-emerald-800" href={`/products/${item.id}`}>
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Twin promos */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-2">
        <div className={`${card} bg-emerald-50 p-6 shadow-md shadow-emerald-100`}>
          <h3 className="text-xl font-semibold text-emerald-900">Promo block left</h3>
          <p className="text-emerald-800">Copy + CTA with supporting visual.</p>
          <div className="mt-4 h-32 rounded-lg border border-dashed border-emerald-300 bg-white" aria-hidden />
          <button className="mt-4 rounded-md border border-emerald-300 px-4 py-2 text-emerald-900">Shop now</button>
        </div>
        <div className={`${card} bg-amber-50 p-6 shadow-md shadow-amber-100`}>
          <h3 className="text-xl font-semibold text-emerald-900">Promo block right</h3>
          <p className="text-emerald-800">Another collection highlight.</p>
          <div className="mt-4 h-32 rounded-lg border border-dashed border-amber-300 bg-white" aria-hidden />
          <button className="mt-4 rounded-md border border-amber-300 px-4 py-2 text-amber-900">Shop now</button>
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-semibold text-emerald-1000">Best sellers</h2>
          <div className="flex gap-2 text-sm">
            <button className="rounded border border-emerald-300 px-3 py-1 text-emerald-800">Prev</button>
            <button className="rounded border border-emerald-300 px-3 py-1 text-emerald-800">Next</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(bestSellers.length ? bestSellers : products).slice(0, 8).map((item) => (
            <div key={item.id} className={`${card} p-4`}>
              <div className="flex items-start justify-between text-xs text-emerald-700">
                {item.category ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">{item.category}</span>
                ) : (
                  <span />
                )}
                <span className="text-emerald-500">Featured</span>
              </div>
              <div className="mt-3 h-24 rounded-md border border-dashed border-emerald-300 bg-emerald-50" aria-hidden />
              <p className="mt-3 font-semibold text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-600 line-clamp-2">{item.description || "Brief description."}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-900">{priceTag(item.price)}</span>
                <Link className="rounded border border-emerald-300 px-3 py-1 text-emerald-800" href={`/products/${item.id}`}>
                  Add
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All products */}
      <section className="mx-auto max-w-6xl space-y-4 px-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-xl font-semibold text-emerald-1000">All products</h2>
          <Link className="text-sm text-emerald-700 underline" href="/products">
            Go to catalog
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(everything.length ? everything : products).map((item) => (
            <div key={item.id} className={`${card} p-4`}>
              <div className="h-32 rounded-md border border-dashed border-emerald-100 bg-emerald-50" aria-hidden />
              <div className="mt-3 space-y-1">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-600 line-clamp-2">{item.description || "Product description."}</p>
                <p className="text-sm text-emerald-700">{item.category || "Category"}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-emerald-900">{priceTag(item.price)}</span>
                  <Link className="text-sm text-emerald-700 underline" href={`/products/${item.id}`}>
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {everything.length === 0 && (
          <p className="rounded-lg border border-emerald-100 bg-white/80 p-6 text-center text-emerald-800">
            No products yet. Add items in Supabase to populate the home page sections.
          </p>
        )}
      </section>

      {/* Triple promos */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        {["Natural & Organic", "Quick Breakfasts", "Party Snacks"].map((title) => (
          <div key={title} className={`${card} bg-white p-6 shadow-md shadow-emerald-50`}>
            <p className="text-sm uppercase tracking-wide text-emerald-600">Nutrition & Wellness</p>
            <h3 className="text-xl font-semibold text-emerald-900">{title}</h3>
            <p className="text-emerald-800">Small paragraph with value prop and CTA.</p>
            <button className="mt-4 rounded-md border border-emerald-300 px-4 py-2 text-emerald-900">Shop now</button>
          </div>
        ))}
      </section>

      {/* Stories / blog */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-semibold text-emerald-900">From our journal</h2>
          <a className="text-sm text-emerald-700 underline" href="/blog">
            View all
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((post) => (
            <article key={post} className={`${card} overflow-hidden`}>
              <div className="h-40 border-b border-dashed border-emerald-100 bg-emerald-50" aria-hidden />
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-600">Category</p>
                <h3 className="text-lg font-semibold text-slate-900">Article title placeholder</h3>
                <p className="text-sm text-slate-600">One or two lines of teaser text.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-6xl m-20 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-100 via-white to-amber-100 px-6 py-10 shadow-[0_10px_40px_rgba(16,185,129,0.15)]">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-emerald-800">Get exclusive</p>
            <h3 className="text-3xl font-extrabold text-emerald-950">Join the newsletter</h3>
            <p className="text-emerald-900">Short note about perks, discounts, or early access.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="flex-1 rounded-lg border-2 border-emerald-300 bg-white px-4 py-3 text-emerald-900 shadow-inner shadow-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Your email"
              />
              <button className="rounded-lg bg-emerald-700 px-5 py-3 text-white shadow-lg shadow-emerald-300 hover:bg-emerald-800 transition-all">
                Subscribe
              </button>
            </div>
          </div>
          <div className="h-25 rounded-xl border-2 border-emerald-300 bg-white p-4 shadow-lg shadow-emerald-10" aria-hidden>
            <div className="h-full w-full rounded-lg border border-dashed border-emerald-300 bg-emerald-50" />
          </div>
        </div>
      </section>

      {/* Footer quick links */}
      {/* <section className="border-t border-emerald-100 bg-emerald-50/70">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
          {["Fruits & Vegetables", "Breakfast", "Meat & Seafood", "Beverages"].map((heading) => (
            <div key={heading} className="space-y-2">
              <h4 className="font-semibold text-emerald-900">{heading}</h4>
              <ul className="space-y-1 text-sm text-emerald-800">
                <li>Link one</li>
                <li>Link two</li>
                <li>Link three</li>
                <li>Link four</li>
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-emerald-100 bg-white/80 py-4 text-center text-sm text-emerald-800">
          Footer utility bar • social icons • app badges
        </div>
      </section> */}
    </div>
  );
}
