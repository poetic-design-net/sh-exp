import { PageHeader } from "@/components/admin/shared/page-header";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { getCategories } from "@/services/categories-server";

export default async function AddCategoryPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Category"
        description="Create a new product category"
      />
      <CategoryForm categories={categories} />
    </div>
  );
}
