import { Suspense } from "react";
import { getCategories } from "@/services/categories-server";
import dynamic from "next/dynamic";

// Dynamically import the client component with no SSR
const CategoriesContent = dynamic(() => import('./categories-content'), { 
  ssr: false,
  loading: () => <div>Loading categories...</div>
});

// Generate empty static params to allow dynamic paths
export function generateStaticParams() {
  return [];
}

// Prevent static optimization for admin routes
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const dynamicParams = true;

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <Suspense fallback={<div>Loading categories...</div>}>
      <CategoriesContent categories={categories} />
    </Suspense>
  );
}
