'use client';

import { PageHeader } from "@/components/admin/shared/page-header";
import { Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category";
import { useState } from "react";
import Image from "next/image";

interface CategoriesContentProps {
  categories: Category[];
}

export default function CategoriesContent({ categories }: CategoriesContentProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage your product categories"
        action={{
          label: "Add Category",
          href: "/admin/categories/add",
          icon: Plus,
        }}
      />

      <div className="overflow-hidden">
        <div className="mx-auto">
          <div className="pt-5 bg-white border border-neutral-100 rounded-xl">
            <div className="px-6">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="text-left">
                      <th className="p-0 border-b border-neutral-100">
                        <div className="pb-3.5">
                          <a className="text-sm text-gray-400 font-medium" href="#">Name</a>
                        </div>
                      </th>
                      <th className="p-0 border-b border-neutral-100">
                        <div className="pb-3.5">
                          <a className="text-sm text-gray-400 font-medium" href="#">Parent Category</a>
                        </div>
                      </th>
                      <th className="p-0 border-b border-neutral-100">
                        <div className="pb-3.5">
                          <a className="text-sm text-gray-400 font-medium" href="#">Image</a>
                        </div>
                      </th>
                      <th className="p-0 border-b border-neutral-100">
                        <div className="pb-3.5"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const parentCategory = categories.find(c => c.id === category.parentId);
                      
                      return (
                        <tr key={category.id}>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{category.name}</span>
                              <span className="text-sm text-gray-500">{category.description}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm">
                              {parentCategory ? parentCategory.name : '-'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            {category.images?.[0] && !imageErrors[category.id] ? (
                              <div className="relative h-8 w-8">
                                <Image
                                  src={category.images[0]}
                                  alt={category.name}
                                  fill
                                  className="object-cover rounded"
                                  onError={() => handleImageError(category.id)}
                                  sizes="32px"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                {imageErrors[category.id] ? 'Failed to load image' : 'No image'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 border-b border-neutral-100">
                            <div className="flex items-center space-x-2">
                              <Link href={`/admin/categories/${category.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/categories/${category.slug}`} target="_blank">
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">
                          No categories found. Create your first category to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
