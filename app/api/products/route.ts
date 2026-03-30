import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    console.log("Products API: Received POST request");

    try {
      const { error: testError } = await supabase.from("products").select("count").limit(1);

      if (testError) {
        console.error("Supabase connection test failed:", testError);
      } else {
        console.log("Supabase connection successful");
      }
    } catch (testErr) {
      console.error("Supabase connection test error:", testErr);
    }

    const body = await req.json();
    console.log("Request body:", body);

    const { name, price, category, subcategory, inStock, image, description } = body;

    if (!name || price === undefined || price === null || price === "") {
      return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Price must be a positive number." }, { status: 400 });
    }

    const productData = {
      name: name.trim(),
      price: parsedPrice,
      category: category?.trim() || null,
      subcategory: subcategory?.trim() || null,
      in_stock: typeof inStock === "boolean" ? inStock : true,
      image: image?.trim() || null,
      description: description?.trim() || null,
    };

    const { data, error } = await supabase.from("products").insert(productData).select().single();

    if (error) {
      console.error("Supabase insert error:", error);

      let errorMessage = "Database error";
      if (error.code === "42501" || error.message?.includes("row-level security policy")) {
        errorMessage = "Row Level Security policy violation. Please disable RLS or update policies in Supabase.";
      } else if (
        error.message?.includes("in_stock") ||
        error.message?.includes("category") ||
        error.message?.includes("subcategory")
      ) {
        errorMessage =
          "Database product columns are missing. Please run add-product-rating-stock.sql and add-product-category-subcategory.sql in Supabase.";
      } else if (error.code === "23505") {
        errorMessage = "Duplicate entry. This product may already exist.";
      } else if (error.code === "23503") {
        errorMessage = "Foreign key constraint violation.";
      } else {
        errorMessage = `Database error: ${error.message || "Unknown error"}`;
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("Products API: Received GET request");

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, category, subcategory, image, description, in_stock")
      .limit(5);

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json(
        { error: `Database read error: ${error.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} products`);
    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error("API GET error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
