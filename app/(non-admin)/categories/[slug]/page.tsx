import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategoryBySlug } from "@/services/categories-server";
import { getProductsByCategory } from "@/services/products-server";
import ProductGrid from "@/app/(non-admin)/products/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 3600; // Revalidate every hour

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ProductGrid products={products} />
      </Suspense>
    </main>
  );
}
