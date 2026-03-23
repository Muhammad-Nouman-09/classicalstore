import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // refresh product list every minute

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
};

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, image, description")
    .order("name");

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  return data ?? [];
}

const demoProducts: Product[] = [
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

function ProductCard({ product }: { product: Product }) {
  const isDemo = product.id.startsWith("demo-");
  return (
    <Link
      key={product.id}
      href={isDemo ? "/products" : `/products/${product.id}`}
      className="group block rounded-lg border border-gray-800 bg-black/40 p-4 transition hover:border-gray-200 hover:bg-black/30"
      aria-disabled={isDemo}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-900 mb-4">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-gray-400 line-clamp-2">{product.description}</p>
        <p className="text-xl font-bold">${product.price}</p>
      </div>
    </Link>
  );
}

export default async function ProductsPage() {
  const products = await getProducts();
  const list = products.length > 0 ? products : demoProducts;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-sm text-gray-400">
          Browse everything we have in stock. Prices shown in your store currency.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-xs text-gray-500">
          Showing demo products. Add products in Supabase to replace these automatically.
        </p>
      )}
    </div>
  );
}
