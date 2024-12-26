import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create category");
  }

  return response.json();
}

export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update category");
  }

  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete category");
  }
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch categories");
  }

  return response.json();
}

export async function getCategory(id: string): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch category");
  }

  return response.json();
}
