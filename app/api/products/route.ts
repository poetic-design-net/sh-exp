import { NextResponse } from "next/server";
import { createProduct, getProducts } from "@/services/products-server";
import { revalidatePath } from "next/cache";

// Route Segment Config
export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = 'force-dynamic'; // Always fetch fresh data for search params

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get product IDs from query params
    const productIds = searchParams.getAll('ids[]');
    
    const options = productIds.length > 0 ? { ids: productIds } : undefined;
    const result = await getProducts(page, limit, options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const product = await createProduct(data);

    // Revalidate the products list
    revalidatePath('/api/products');
    revalidatePath('/admin/products');
    

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
