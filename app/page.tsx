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
  rating?: number;
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
    console.error("Failed to load products (fallback)", fallback.error);
    return [];
  }

  console.error("Failed to load products", primary.error);
  return [];
}

const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Neon Street Hoodie",
    price: 79,
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    description: "Oversized fit with soft fleece interior and reflective piping.",
    category: "Hoodies",
    rating: 4.7,
  },
  {
    id: "2",
    name: "Midnight Runner Sneakers",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1528701800489-20be9f461cde?auto=format&fit=crop&w=900&q=80",
    description: "Chunky sole, breathable mesh, built for all-day city walks.",
    category: "Shoes",
    rating: 4.8,
  },
  {
    id: "3",
    name: "Chrome Mini Bag",
    price: 58,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description: "High-shine finish with crossbody strap and magnetic closure.",
    category: "Bags",
    rating: 4.6,
  },
  {
    id: "4",
    name: "Sunset Gradient Tee",
    price: 42,
    image:
      "https://images.unsplash.com/photo-1496747611180-206a5c8c9f1f?auto=format&fit=crop&w=900&q=80",
    description: "Boxy cut, premium cotton, dip-dyed ombr? fade.",
    category: "Tees",
    rating: 4.5,
  },
  {
    id: "5",
    name: "Layered Chain Set",
    price: 35,
    image:
      "https://images.unsplash.com/photo-1521572267365-46b99b6df8e2?auto=format&fit=crop&w=900&q=80",
    description: "Mixed metals with charms for easy stacking.",
    category: "Jewellery",
    rating: 4.4,
  },
  {
    id: "6",
    name: "Glow Serum Duo",
    price: 54,
    image:
      "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=900&q=80",
    description: "Vitamin C + niacinamide for daily dewy skin.",
    category: "Beauty",
    rating: 4.9,
  },
  {
    id: "7",
    name: "Sculpt Joggers",
    price: 68,
    image:
      "https://images.unsplash.com/photo-1521572163478-5b69a1fe9acb?auto=format&fit=crop&w=900&q=80",
    description: "Tapered fit, stretch waistband, ankle zips.",
    category: "Pants",
    rating: 4.6,
  },
  {
    id: "8",
    name: "Velvet Strap Heels",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    description: "Block heel, plush velvet, secure buckle strap.",
    category: "Shoes",
    rating: 4.3,
  },
];

function priceTag(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

const categoryCards = [
  {
    name: "Clothes",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Jewellery",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Shoes",
    image: "https://images.unsplash.com/photo-1528701800489-20be9f461cde?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Bags",
    image: "https://images.unsplash.com/photo-1521572267365-46b99b6df8e2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Cosmetics",
    image: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Home & Skin Care",
    image: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=80",
  },
];

const features = [
  { title: "Free Delivery", text: "On all orders over $50", icon: "??" },
  { title: "Easy Returns", text: "30-day risk-free", icon: "??" },
  { title: "Secure Payment", text: "256-bit encryption", icon: "??" },
  { title: "Cash on Delivery", text: "Available in select cities", icon: "??" },
];

const testimonials = [
  {
    name: "Avery S.",
    text: "Classical Store nails the balance of bold style and everyday comfort. My new go-to for quick fits.",
  },
  {
    name: "Jordan R.",
    text: "Checkout was smooth, shipping was quick, and the packaging felt premium.",
  },
  {
    name: "Mila P.",
    text: "Obsessed with the gradients and the curated drops. The rewards emails are ??.",
  },
];

export default async function Home() {
  const products = await getProducts();
  const hydratedProducts = products.length
    ? products.map((p) => ({ ...p, rating: p.rating ?? 4.6 }))
    : fallbackProducts;

  const trending = hydratedProducts.slice(0, 8);
  const heroHighlight = hydratedProducts[0];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="space-y-24 pb-20 pt-6">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/15 via-orange-400/10 to-pink-500/15" aria-hidden />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-fuchsia-700 shadow-sm">
                New drop ? Spring / Summer 2026
              </p>
              <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
                Upgrade Your Style Today
              </h1>
              <p className="max-w-xl text-lg text-slate-700">
                Bold fits, layered textures, and curated essentials built for the city pace. Fresh arrivals weekly
                with member-only perks.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(236,72,153,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(236,72,153,0.35)]"
                >
                  Shop Now
                </Link>
                <Link
                  href="#trending"
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-fuchsia-300 hover:text-fuchsia-600"
                >
                  Explore Trending
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
                <span className="pill">Free delivery over $50</span>
                <span className="pill">24h dispatch</span>
                <span className="pill">Rewards + cashbacks</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_25px_70px_rgba(0,0,0,0.08)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 via-transparent to-orange-500/25" />
              <img
                src={heroHighlight?.image || fallbackProducts[0].image!}
                alt={heroHighlight?.name || "Hero fashion"}
                className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/85 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>{heroHighlight?.name || "Statement Set"}</span>
                  <span className="text-fuchsia-600">{priceTag(heroHighlight?.price)}</span>
                </div>
                <p className="text-xs text-slate-500">Styled drop ? Limited run</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="mx-auto max-w-6xl space-y-6 px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="/products" className="text-sm font-semibold text-fuchsia-600 hover:text-fuchsia-700">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categoryCards.map((cat) => (
              <article
                key={cat.name}
                className="group relative overflow-hidden rounded-2xl bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-36 w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-white">
                  <p className="text-sm font-semibold">{cat.name}</p>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Explore</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Trending Products */}
        <section id="trending" className="mx-auto max-w-6xl space-y-6 px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-500">Trending</p>
              <h2 className="text-2xl font-bold">Hot right now</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-fuchsia-600 hover:text-fuchsia-700">
              Shop the collection
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((item) => (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-fuchsia-200 hover:shadow-[0_20px_60px_rgba(236,72,153,0.16)]"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={item.image ?? fallbackProducts[0].image!} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-fuchsia-600 backdrop-blur">
                    {item.category || "New"}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{item.description || "Statement piece for every day."}</p>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-slate-900">{priceTag(item.price)}</span>
                    <span className="text-amber-500">? {item.rating?.toFixed(1)}</span>
                  </div>
                  <button className="group/button relative w-full overflow-hidden rounded-full bg-slate-900 px-4 py-2 text-white transition hover:-translate-y-[2px]">
                    <span className="relative z-10">Add to Cart</span>
                    <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-orange-400 transition duration-300 group-hover/button:translate-y-0" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Offer Banner */}
        <section className="mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-orange-500 p-[1px] shadow-[0_18px_60px_rgba(236,72,153,0.25)]">
            <div className="flex flex-col gap-4 rounded-3xl bg-slate-900 px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">Limited time</p>
                <h3 className="text-3xl font-black">Flat 20% Off on Selected Items</h3>
                <p className="text-sm text-slate-200">Refresh your rotation with bold colors and tactile textures.</p>
              </div>
              <Link
                href="/products"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Shop Deals
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl space-y-6 px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Why shop with us</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Trust markers</span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-fuchsia-200 hover:shadow-md"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-100 via-purple-100 to-orange-100 text-lg">
                  {item.icon}
                </div>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-6xl space-y-6 px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">What customers say</h2>
            <span className="text-sm text-fuchsia-600">4.8/5 average rating</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <article
                key={t.name}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:border-fuchsia-200"
              >
                <div className="flex items-center gap-3 pb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white flex items-center justify-center font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-amber-500">?????</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{t.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-slate-50/70">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold">
                <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-orange-400 p-[2px] shadow-lg shadow-fuchsia-200">
                  <span className="flex h-full w-full items-center justify-center rounded-2xl bg-white text-fuchsia-600">CS</span>
                </span>
                <span>Classical Store</span>
              </div>
              <p className="text-sm text-slate-600">
                Fashion and lifestyle drops curated for the bold. New edits every week.
              </p>
              <div className="flex gap-3 text-sm font-semibold">
                <span className="social-icon">FB</span>
                <span className="social-icon">IG</span>
                <span className="social-icon">X</span>
                <span className="social-icon">IN</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Links</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Stay updated</h4>
              <div className="mt-3 flex gap-3">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  placeholder="Your email"
                />
                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Join</button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
