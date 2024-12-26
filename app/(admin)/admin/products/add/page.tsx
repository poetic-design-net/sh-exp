import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { getCategories } from "@/services/categories-server";

export default async function AddProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Create a new product"
      />
      <ProductForm categories={categories} />
    </div>
  );
}
