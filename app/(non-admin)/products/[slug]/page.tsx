import { ProductDetails } from "../product-details";
import { getProductBySlug } from "@/services/products-server";
import { getCategoryById } from "@/services/categories-server";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    throw new Error("Product not found");
  }
  
  let category;
  if (product.categoryIds && product.categoryIds.length > 0) {
    // Get the first category for now
    const categoryResult = await getCategoryById(product.categoryIds[0]);
    if (categoryResult) {
      category = categoryResult;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} category={category} />
    </div>
  );
}
