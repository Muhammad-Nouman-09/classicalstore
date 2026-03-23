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
    // Handle demo products
    const demoProducts = [
      {
        id: "demo-1",
        name: "Classical Vinyl",
        price: 25,
        image: null,
        description: "Limited pressing of timeless symphonies.",
      },
      {
        id: "demo-2",
        name: "Concert Ticket",
        price: 75,
        image: null,
        description: "Front-row experience for your favorite orchestra.",
      },
      {
        id: "demo-3",
        name: "Merch Bundle",
        price: 40,
        image: null,
        description: "T-shirt, poster, and sticker pack in one bundle.",
      },
    ];
    return demoProducts.find(p => p.id === id) || null;
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
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`Failed to load product: ${error.message}`);
  }

  return data;
}

type PageProps = {
  params: { id: string };
};

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <Link href="/products" className="text-sm text-gray-400 hover:text-white">
        {"<- Back to products"}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        <div className="rounded-lg border border-gray-800 bg-black/40 p-4">
          <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-900">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No image
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-xl font-semibold">${product.price}</p>
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
            <div className="flex gap-3 pt-2">
              <AddToCartButton product={product} />
              <a
                href="#order-form"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
              >
                Buy now
              </a>
            </div>
          </div>
        </div>

        <OrderForm
          productId={product.id}
          productName={product.name}
          price={product.price}
        />
      </div>
    </div>
  );
}