export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string | null;
  images?: string[];  // Ändern zu einem Array von URLs wie bei Products
  createdAt: number;
  updatedAt: number;
}

export type CreateCategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
