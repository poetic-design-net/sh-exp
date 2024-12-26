"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory, updateCategory } from "@/services/categories-client";
import type { Category } from "@/types/category";
import Image from "next/image";

interface CategoryFormProps {
  category?: Category;
  categories?: Category[];
  isEdit?: boolean;
}

export function CategoryForm({ category, categories = [], isEdit }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState(category?.parentId || "none");

  // Filter out the current category and its children from parent options
  const availableParentCategories = categories.filter(c => {
    if (!category) return true;
    return c.id !== category.id && !isChildCategory(c, category.id, categories);
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const imageUrl = formData.get("image") as string;
    
    const images = imageUrl ? [imageUrl] : undefined;

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      slug: formData.get("slug") as string,
      parentId: selectedParentId === "none" ? null : selectedParentId,
      images,
    };

    try {
      if (isEdit && category) {
        await updateCategory(category.id, data);
      } else {
        await createCategory(data);
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Error saving category:", error);
      setError(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={category?.name}
            className="mt-1"
            placeholder="Category Name"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <Input
            id="slug"
            name="slug"
            required
            defaultValue={category?.slug}
            className="mt-1"
            placeholder="category-name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={category?.description}
          className="mt-1"
          placeholder="Category description..."
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
          Parent Category
        </label>
        <Select value={selectedParentId} onValueChange={setSelectedParentId}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent category</SelectItem>
            {availableParentCategories.map((parentCategory) => (
              <SelectItem key={parentCategory.id} value={parentCategory.id}>
                {parentCategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <Input
          id="image"
          name="image"
          type="url"
          defaultValue={category?.images?.[0]}
          className="mt-1"
          placeholder="https://storage.googleapis.com/..."
        />
        {category?.images?.[0] && (
          <div className="mt-2 relative w-32 aspect-square rounded-lg overflow-hidden">
            <Image
              src={category.images[0]}
              alt={category.name}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/categories")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}

// Helper function to check if a category is a child of another category
function isChildCategory(category: Category, parentId: string, allCategories: Category[]): boolean {
  let current = category;
  while (current.parentId) {
    if (current.parentId === parentId) return true;
    const parent = allCategories.find(c => c.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return false;
}
