import { getProducts } from "@/services/products-server";
import { getCategories } from "@/services/categories-server";
import ProductsOverview from "@/app/(non-admin)/products/products-overview";

export default async function ProductsPage() {
  const [productsResult, categories] = await Promise.all([
    getProducts(1, 100), // Get first 100 products
    getCategories(),
  ]);

  // Filter for active, in-stock, and visible products only
  const availableProducts = productsResult.products.filter(product => 
    product.isActive && 
    product.stockStatus === 'instock' &&
    product.catalogVisibility !== 'hidden' &&
    product.status !== 'private'
  );

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Produkte</h1>
      </div>
      <div className="w-full">
        <ProductsOverview 
          products={availableProducts} 
          categories={categories}
        />
      </div>
    </div>
  );
}
