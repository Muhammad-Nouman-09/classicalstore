import Link from "next/link";
import { Suspense } from "react";
import ClientProductCard from "@/components/ClientProductCard";
import HomeOrderNotice from "@/components/HomeOrderNotice";
import { supabase } from "@/lib/supabase";
import { formatPrice, mergeProductRatings } from "@/lib/productUtils";

export const revalidate = 0;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
  category?: string | null;
  subcategory?: string | null;
  rating?: number | null;
  rating_count?: number | null;
  in_stock?: boolean | null;
};

async function getProducts(): Promise<Product[]> {
  const primary = await supabase
    .from("products")
    .select("id, name, price, image, description, category, subcategory, rating, in_stock")
    .order("name");

  if (!primary.error) {
    const { data: ratingRows } = await supabase.from("product_ratings").select("product_id, rating");
    return mergeProductRatings(primary.data ?? [], ratingRows ?? []);
  }

  if (
    primary.error?.message?.toLowerCase().includes("category") ||
    primary.error?.message?.toLowerCase().includes("rating") ||
    primary.error?.message?.toLowerCase().includes("in_stock")
  ) {
    const fallback = await supabase.from("products").select("id, name, price, image, description, category, subcategory").order("name");
    if (!fallback.error) {
      const { data: ratingRows } = await supabase.from("product_ratings").select("product_id, rating");
      return mergeProductRatings(fallback.data ?? [], ratingRows ?? []);
    }
    console.error("Failed to load products (fallback)", fallback.error);
    return [];
  }

  console.error("Failed to load products", primary.error);
  return [];
}

const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Tailored Linen Set",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    description: "Relaxed tailoring with a clean drape for everyday polish.",
    category: "Clothes",
    rating: 4.8,
    in_stock: true,
  },
  {
    id: "2",
    name: "Satin Evening Heels",
    price: 115,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
    description: "Soft sheen, sculpted heel, and a secure ankle strap.",
    category: "Shoes",
    rating: 4.7,
    in_stock: true,
  },
  {
    id: "3",
    name: "Gold Layer Necklace",
    price: 42,
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80",
    description: "Stacked chains designed to elevate simple outfits fast.",
    category: "Jewellery",
    rating: 4.6,
    in_stock: true,
  },
  {
    id: "4",
    name: "Velvet Vanity Kit",
    price: 54,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    description: "Glow-first beauty staples with a polished finish.",
    category: "Cosmetics",
    rating: 4.5,
    in_stock: true,
  },
  {
    id: "5",
    name: "Structured City Tote",
    price: 73,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
    description: "Roomy interior with a sharp silhouette for daily carry.",
    category: "Accessories",
    rating: 4.7,
    in_stock: false,
  },
  {
    id: "6",
    name: "Daily Skin Ritual Set",
    price: 61,
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
    description: "Hydrating essentials for a soft, balanced routine.",
    category: "Home & Skincare",
    rating: 4.6,
    in_stock: true,
  },
  {
    id: "7",
    name: "Pleated Weekend Dress",
    price: 97,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    description: "Fluid movement, flattering cut, and easy day-to-night styling.",
    category: "Clothes",
    rating: 4.8,
    in_stock: true,
  },
  {
    id: "8",
    name: "Minimal Leather Slides",
    price: 68,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
    description: "Low-profile comfort with a refined summer finish.",
    category: "Shoes",
    rating: 4.4,
    in_stock: true,
  },
];

const categories = [
  {
    name: "Clothes",
    subtitle: "Tailored layers and everyday essentials",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Shoes",
    subtitle: "Statement pairs built for long days",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bags",
    subtitle: "Clean silhouettes with practical storage",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Jewellery",
    subtitle: "Finishing pieces with shine and texture",
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cosmetics",
    subtitle: "Glow-focused beauty and makeup picks",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Home & Skincare",
    subtitle: "Daily rituals for calm, polished living",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
  },
];

const benefits = [
  { title: "Free delivery", text: "On orders above Rs 50 across major cities." },
  { title: "Easy returns", text: "Seven-day returns on eligible items." },
  { title: "Secure checkout", text: "Protected payments with order confirmation." },
  { title: "Fast dispatch", text: "Most orders packed and sent within 24 hours." },
];

const testimonials = [
  {
    name: "Sara K.",
    text: "The pieces feel more premium than the price suggests. My order arrived fast and looked exactly like the photos.",
  },
  {
    name: "Amna R.",
    text: "I came for the heels and ended up buying skincare too. The homepage made everything feel easy to browse.",
  },
  {
    name: "Hiba M.",
    text: "Clean styling, strong product shots, and the packaging was lovely. It finally feels like a real fashion store.",
  },
];

export default async function Home() {
  const products = await getProducts();
  const catalog = products.length ? products : fallbackProducts;
  const featuredProducts = catalog.slice(0, 4);
  const bestSellers = catalog.slice(4, 8).length ? catalog.slice(4, 8) : catalog.slice(0, 4);
  const heroProduct = catalog[0] ?? fallbackProducts[0];

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <main className="pb-20">
        <Suspense fallback={null}>
          <HomeOrderNotice />
        </Suspense>
        <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(135deg,rgba(244,239,229,0.95),rgba(255,255,255,0.92)_60%,rgba(233,224,209,0.75))]">
          <div
            className="absolute inset-0 opacity-60"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(24,24,24,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(183,147,95,0.18), transparent 26%)",
            }}
          />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:px-6 lg:py-20">
            <div className="flex flex-col justify-center space-y-7">
              <p className="inline-flex w-fit items-center rounded-full border border-[var(--border-strong)] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Shop Trendy Fashion and Lifestyle
              </p>
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                  Upgrade your style with modern fashion, beauty, and home essentials.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                  Classical Store is built for shopping, not browsing confusion. Discover curated outfits, jewellery,
                  shoes, cosmetics, and skincare in a clean storefront that puts products first.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
                >
                  Shop now
                </Link>
                <Link
                  href="#featured-products"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
                >
                  Browse featured picks
                </Link>
              </div>
              <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                  <p className="text-2xl font-semibold text-[var(--foreground)]">24h</p>
                  <p className="text-sm text-[var(--muted)]">Dispatch on most in-stock orders</p>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                  <p className="text-2xl font-semibold text-[var(--foreground)]">4.8/5</p>
                  <p className="text-sm text-[var(--muted)]">Average rating from happy shoppers</p>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                  <p className="text-2xl font-semibold text-[var(--foreground)]">20% Off</p>
                  <p className="text-sm text-[var(--muted)]">Selected styles this week only</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <article className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#d9c9b2] shadow-[0_28px_80px_rgba(17,17,17,0.14)]">
                <img src={heroProduct.image ?? fallbackProducts[0].image!} alt={heroProduct.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" aria-hidden />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">New arrival</p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em]">{heroProduct.name}</h2>
                      <p className="mt-2 max-w-xs text-sm text-white/80">
                        {heroProduct.description ?? "Refined pieces chosen to anchor the new season wardrobe."}
                      </p>
                    </div>
                    <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                      {formatPrice(heroProduct.price)}
                    </div>
                  </div>
                </div>
              </article>

              <div className="grid gap-4">
                <article className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Store focus</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                    Fashion-led shopping that feels premium from the first click.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Strong imagery, clear pricing, and direct add-to-cart actions keep the experience commercial and easy to trust.
                  </p>
                </article>
                <article className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card-tint)] p-6 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">This week&apos;s offer</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Flat 20% off</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Use the spotlight section to push bundles, limited drops, and conversion-friendly urgency.
                  </p>
                  <Link
                    href="/products"
                    className="mt-5 inline-flex items-center justify-center rounded-full border border-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-white"
                  >
                    Shop the sale
                  </Link>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Categories</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                Shop by department
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
              The homepage now points visitors straight into fashion, accessories, beauty, and skincare instead of making them decode what the store sells.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href="/products"
                className="group relative isolate overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[#e9e0d1] shadow-[0_18px_44px_rgba(17,17,17,0.08)] transition hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden />
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.03em]">{category.name}</h3>
                      <p className="mt-2 text-sm text-white/80">{category.subtitle}</p>
                    </div>
                    <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                      Explore
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="featured-products" className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Featured products</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                Products users can understand in seconds
              </h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline">
              View full catalog
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ClientProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,#171717,#2b241d)] px-6 py-10 text-white shadow-[0_28px_80px_rgba(17,17,17,0.16)] lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d7c1a0]">Conversion banner</p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Flat 20% off selected fashion and beauty picks this week.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                  This section gives the homepage the urgency it was missing: a clear offer, immediate value, and a direct CTA back into the catalog.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold">20%</p>
                  <p className="text-sm text-white/70">Off spotlight items</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold">48 hrs</p>
                  <p className="text-sm text-white/70">Limited-time campaign window</p>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5"
                >
                  Shop deals
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="best-sellers" className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Best sellers</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                Strong second scroll section for conversion momentum
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
              Repeating product visibility later on the page helps shoppers re-engage after the category and promo sections.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {bestSellers.map((product) => (
              <ClientProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)]"
              >
                <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card-tint)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Trust
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Testimonials</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                Social proof that adds confidence
              </h2>
            </div>
            <div className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
              Rated 4.8/5 by recent customers
            </div>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.05)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-tint)] text-sm font-semibold text-[var(--foreground)]">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{testimonial.name}</p>
                    <p className="text-sm text-[var(--muted)]">Verified customer</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{testimonial.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
