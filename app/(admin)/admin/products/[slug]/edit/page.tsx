import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { getProductBySlug } from "@/services/products-server";
import { getCategories } from "@/services/categories-server";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: {
    slug: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([
    getProductBySlug(params.slug),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Product"
        description="Update product details"
      />
      <ProductForm 
        product={product} 
        categories={categories} 
        isEdit 
      />
    </div>
  );
}
