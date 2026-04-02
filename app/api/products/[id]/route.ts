import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function buildProductData(body: {
  name?: string;
  price?: number | string;
  category?: string | null;
  subcategory?: string | null;
  inStock?: boolean;
  image?: string | null;
  description?: string | null;
}) {
  const { name, price, category, subcategory, inStock, image, description } = body;

  if (!name || price === undefined || price === null || price === "") {
    return { error: "Name and price are required." };
  }

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: "Price must be a positive number." };
  }

  return {
    productData: {
      name: name.trim(),
      price: parsedPrice,
      category: category?.trim() || null,
      subcategory: subcategory?.trim() || null,
      in_stock: typeof inStock === "boolean" ? inStock : true,
      image: image?.trim() || null,
      description: description?.trim() || null,
    },
  };
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = buildProductData(body);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .update(result.productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to update product." }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to delete product." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
