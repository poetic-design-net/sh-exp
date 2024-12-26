import { Suspense } from "react";
import { getCategories, getCategoryById } from "@/services/categories-server";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the client component with no SSR
const EditContent = dynamic(() => import('./edit-content'), { 
  ssr: false,
  loading: () => <div>Loading editor...</div>
});

// Generate static paths at build time
export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((category) => ({
      id: category.id,
    }));
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}

export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const dynamicParams = true;

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const [category, categories] = await Promise.all([
    getCategoryById(params.id),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <EditContent category={category} categories={categories} />
    </Suspense>
  );
}
