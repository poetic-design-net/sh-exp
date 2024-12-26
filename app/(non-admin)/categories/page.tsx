import { Suspense } from "react";
import { getCategories } from "@/services/categories-server";
import CategoryList from "@/components/categories/category-list";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 3600; // Revalidate every hour

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">All Categories</h1>
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <CategoryList categories={categories} />
      </Suspense>
    </main>
  );
}
