import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OrderForm from "./OrderForm";
import AddToCartButton from "./AddToCartButton";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const demoPattern = /^demo-\d+$/;

async function getProduct(id: string | undefined): Promise<Product | null> {
  if (!id) {
    return null;
  }

  if (demoPattern.test(id)) {
    const demoProducts = [
      {
        id: "demo-1",
        name: "Classical Linen Set",
        price: 85,
        image: null,
        description: "Relaxed tailoring designed for clean, all-day styling.",
      },
      {
        id: "demo-2",
        name: "Signature Beauty Edit",
        price: 64,
        image: null,
        description: "Everyday beauty picks curated for glow and ease.",
      },
      {
        id: "demo-3",
        name: "Weekend Accessories Bundle",
        price: 48,
        image: null,
        description: "A polished set of extras to complete your look.",
      },
    ];

    return demoProducts.find((product) => product.id === id) || null;
  }

  if (!uuidPattern.test(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, image, description")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to load product: ${error.message}`);
  }

  return data;
}

type PageProps = {
  params: { id: string };
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Link
        href="/products"
        className="inline-flex rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
      >
        Back to products
      </Link>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-[0_18px_44px_rgba(17,17,17,0.06)]">
          <div className="aspect-[4/5] overflow-hidden bg-[var(--card-tint)]">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">No image</div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Product detail</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{product.name}</h1>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              {formatPrice(product.price)}
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {product.description || "A curated fashion and lifestyle piece designed to fit clean modern styling."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[var(--card-tint)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Shipping</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">Dispatch within 24 hours</p>
              </div>
              <div className="rounded-2xl bg-[var(--card-tint)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Returns</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">Easy seven-day returns</p>
              </div>
              <div className="rounded-2xl bg-[var(--card-tint)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Payment</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">Secure checkout available</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <AddToCartButton product={product} />
              <a
                href="#order-form"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--border-strong)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
              >
                Buy now
              </a>
            </div>
          </section>

          <OrderForm productId={product.id} productName={product.name} price={product.price} />
        </div>
      </div>
    </div>
  );
}
