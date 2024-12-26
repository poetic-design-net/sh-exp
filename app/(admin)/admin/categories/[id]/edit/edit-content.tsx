'use client';

import { PageHeader } from "@/components/admin/shared/page-header";
import { CategoryForm } from "@/components/admin/categories/category-form";
import type { Category } from "@/types/category";

interface EditContentProps {
  category: Category;
  categories: Category[];
}

export default function EditContent({ category, categories }: EditContentProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Category"
        description="Update category details"
      />
      <CategoryForm 
        category={category} 
        categories={categories} 
        isEdit 
      />
    </div>
  );
}
