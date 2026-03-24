import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    console.log("Products API: Received POST request");

    // Test Supabase connection
    console.log("Testing Supabase connection in API...");
    try {
      const { data: testData, error: testError } = await supabase
        .from("products")
        .select("count")
        .limit(1);

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

    const { name, price, image, description } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required." },
        { status: 400 }
      );
    }

    // Validate price
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number." },
        { status: 400 }
      );
    }

    // Insert product
    const productData = {
      name: name.trim(),
      price: Math.round(parsedPrice), // Store as cents
      image: image?.trim() || null,
      description: description?.trim() || null,
    };

    console.log("Attempting to insert product:", productData);
    console.log("Data types:", {
      name: typeof productData.name,
      price: typeof productData.price,
      image: typeof productData.image,
      description: typeof productData.description,
    });

    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error hint:", error.hint);
      console.error("Attempted to insert:", productData);

      // Provide specific guidance for common errors
      let errorMessage = "Database error";
      if (error.code === '42501' || error.message?.includes('row-level security policy')) {
        errorMessage = "Row Level Security policy violation. Please disable RLS or update policies in Supabase.";
      } else if (error.code === '23505') {
        errorMessage = "Duplicate entry. This product may already exist.";
      } else if (error.code === '23503') {
        errorMessage = "Foreign key constraint violation.";
      } else {
        errorMessage = `Database error: ${error.message || 'Unknown error'}`;
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("Products API: Received GET request");

    // Test basic connectivity
    console.log("Testing products table access...");
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image, description")
      .limit(5);

    if (error) {
      console.error("Supabase GET error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Database read error: ${error.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} products`);
    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error("API GET error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}