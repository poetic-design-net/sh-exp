"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Membership, CreateMembershipInput, UpdateMembershipInput } from "@/types/membership";
import type { Product } from "@/types/product";
import { createMembership, updateMembership } from "@/app/actions/memberships";
import { getProducts } from "@/services/products-client";

interface MembershipFormProps {
  initialData?: Membership;
}

export function MembershipForm({ initialData }: MembershipFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    duration: initialData?.duration || 30,
    features: initialData?.features?.join("\n") || "",
    isActive: initialData?.isActive ?? true,
    productIds: initialData?.productIds || [],
    maxMembers: initialData?.maxMembers || undefined
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.products);
      } catch (err) {
        setError("Failed to load products");
      }
    };
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const membershipData = {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        features: formData.features.split("\n").filter(f => f.trim()),
        isActive: formData.isActive,
        productIds: formData.productIds,
        maxMembers: formData.maxMembers
      };

      if (initialData) {
        await updateMembership(initialData.id, membershipData as UpdateMembershipInput);
      } else {
        await createMembership(membershipData as CreateMembershipInput);
      }

      router.push("/admin/memberships");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium mb-1">
          Duration (days)
        </label>
        <Input
          id="duration"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="maxMembers" className="block text-sm font-medium mb-1">
          Max Members (optional)
        </label>
        <Input
          id="maxMembers"
          type="number"
          value={formData.maxMembers || ""}
          onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value ? parseInt(e.target.value) : undefined })}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="features" className="block text-sm font-medium mb-1">
          Features (one per line)
        </label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          placeholder="Enter features, one per line"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Products</label>
        <div className="space-y-2 border rounded-md p-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`product-${product.id}`}
                checked={formData.productIds.includes(product.id)}
                onChange={() => handleProductToggle(product.id)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={isLoading}
              />
              <label htmlFor={`product-${product.id}`} className="text-sm">
                {product.name} - €{product.price}
              </label>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-gray-500">No products available</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
          disabled={isLoading}
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Active
        </label>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {initialData ? "Updating..." : "Creating..."}
          </span>
        ) : (
          <span>{initialData ? "Update Membership" : "Create Membership"}</span>
        )}
      </Button>
    </form>
  );
}
