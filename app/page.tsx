import Link from "next/link";
import { Suspense } from "react";
import ClientProductCard from "@/components/ClientProductCard";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";
import HomeOrderNotice from "@/components/HomeOrderNotice";
import { buildCategoryDirectory, buildProductsFilterHref } from "@/lib/categorySystem";
import { supabase } from "@/lib/supabase";
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
  rating?: number | null;
  rating_count?: number | null;
  in_stock?: boolean | null;
  featured?: boolean | null;
};

const fallbackHeroSlides: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80",
    alt: "Fashion collection background",
  },
  {
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=80",
    alt: "Women shopping fashion carousel image",
  },
  {
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=80",
    alt: "Modern fashion editorial background",
  },
];

async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from("hero_images")
    .select("image_url, alt_text, sort_order")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Failed to load hero images", error);
    return fallbackHeroSlides;
  }

  const slides = (data ?? [])
    .filter((item) => Boolean(item.image_url))
    .map<HeroSlide>((item) => ({
      image: item.image_url,
      alt: item.alt_text?.trim() || "Hero carousel image",
    }));

  return slides.length > 0 ? slides : fallbackHeroSlides;
}

async function getProducts(): Promise<Product[]> {
  const primary = await supabase
    .from("products")
    .select("id, name, price, image, description, category, subcategory, rating, in_stock, featured")
    .order("name");

  if (!primary.error) {
    const { data: ratingRows } = await supabase.from("product_ratings").select("product_id, rating");
    return mergeProductRatings(primary.data ?? [], ratingRows ?? []);
  }

  if (
    primary.error?.message?.toLowerCase().includes("category") ||
    primary.error?.message?.toLowerCase().includes("rating") ||
    primary.error?.message?.toLowerCase().includes("in_stock") ||
    primary.error?.message?.toLowerCase().includes("featured")
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

function TrustIcon({ title }: { title: string }) {
  if (title === "Free delivery") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h11v8H3z" />
        <path d="M14 10h3l4 4v1h-7z" />
        <circle cx="7.5" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
      </svg>
    );
  }

  if (title === "Easy returns") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 7H4v4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 11a8 8 0 1 0 2.3-5.7L4 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (title === "Secure checkout") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3Z" />
        <path d="m9.5 12 1.7 1.7 3.8-4.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8v4l3 2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export default async function Home() {
  const products = await getProducts();
  const heroSlides = await getHeroSlides();
  const catalog = products.length ? products : fallbackProducts;
  const categories = buildCategoryDirectory(catalog).slice(0, 6);
  const featuredPool = catalog.filter((product) => product.featured);
  const featuredProducts = (featuredPool.length ? featuredPool : catalog).slice(0, 4);
  const bestSellers =
    catalog.filter((product) => !featuredProducts.some((featuredProduct) => featuredProduct.id === product.id)).slice(0, 4).length
      ? catalog.filter((product) => !featuredProducts.some((featuredProduct) => featuredProduct.id === product.id)).slice(0, 4)
      : featuredProducts;

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <main className="pb-20">
        <Suspense fallback={null}>
          <HomeOrderNotice />
        </Suspense>
        <HeroCarousel slides={heroSlides} />

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
                href={buildProductsFilterHref({ category: category.name })}
                className="group relative isolate aspect-[5/4] min-h-[260px] w-full overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[#e9e0d1] shadow-[0_18px_44px_rgba(17,17,17,0.08)] transition hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden />
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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

        <section id="featured-products" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Featured products</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                Best picks placed at the bottom for a final conversion push
              </h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline">
              View full catalog
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
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
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
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
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-tint)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <span className="text-[#b8860b]">
                    <TrustIcon title={benefit.title} />
                  </span>

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
