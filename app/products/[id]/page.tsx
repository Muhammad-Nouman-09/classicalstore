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

async function getProduct(id: string | undefined): Promise<Product | null> {
  if (!id || !uuidPattern.test(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, image, description")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`Failed to load product: ${error.message}`);
  }

  return data;
}

type PageProps = {
  params: { id: string };
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      <Link href="/products" className="text-sm text-emerald-700 hover:text-emerald-500 inline-flex items-center gap-2">
        <span>←</span> Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        <div className="rounded-lg border border-emerald-100 bg-white/90 p-4 shadow-sm shadow-emerald-50">
          <div className="aspect-[4/3] overflow-hidden rounded-md border border-emerald-100 bg-emerald-50">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-emerald-500">
                No image
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <h1 className="text-3xl font-bold text-emerald-900">{product.name}</h1>
            <p className="text-xl font-semibold text-emerald-800">${product.price}</p>
            <p className="text-emerald-800 leading-relaxed">{product.description}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <AddToCartButton product={product} />
              <a
                href="#order-form"
                className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition"
              >
                Order by phone
              </a>
            </div>
          </div>
        </div>

        <OrderForm productId={product.id} productName={product.name} price={product.price} />
      </div>
    </div>
  );
}
