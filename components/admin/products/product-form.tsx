"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProduct, updateProduct } from "@/services/products-client";
import type { Product, ProductSubscription } from "@/types/product";
import type { Category } from "@/types/category";

interface ProductFormProps {
  product?: Product;
  categories?: Category[];
  isEdit?: boolean;
}

export function ProductForm({ product, categories = [], isEdit }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || [""]);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(product?.categoryIds || []);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [isSubscription, setIsSubscription] = useState(product?.isSubscription ?? false);
  const [subscriptionPeriod, setSubscriptionPeriod] = useState(product?.subscription?.period ?? "month");

  const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id));

  const addImage = () => setImages([...images, ""]);
  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      categoryIds: selectedCategoryIds,
      images: images.filter(img => img.trim() !== ""),
      slug: formData.get("slug") as string,
      isActive,
      isSubscription,
      type: isSubscription ? "subscription" : "simple",
    };

    if (isSubscription) {
      const subscription: ProductSubscription = {
        period: subscriptionPeriod,
        price: data.price,
        length: 0, // Default values as per the example
        trialLength: 0,
      };
      data.subscription = subscription;
    }

    try {
      if (isEdit && product) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      setError(error instanceof Error ? error.message : "Failed to save product");
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
            defaultValue={product?.name}
            className="mt-1"
            placeholder="Product Name"
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
            defaultValue={product?.slug}
            className="mt-1"
            placeholder="product-name"
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
          required
          defaultValue={product?.description}
          className="mt-1"
          placeholder="Product description..."
          rows={4}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Type
          </label>
          <Select
            value={isSubscription ? "subscription" : "simple"}
            onValueChange={(value) => setIsSubscription(value === "subscription")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple Product</SelectItem>
              <SelectItem value="subscription">Subscription Product</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isSubscription && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Period
            </label>
            <Select
              value={subscriptionPeriod}
              onValueChange={setSubscriptionPeriod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price {isSubscription ? `per ${subscriptionPeriod}` : ""}
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            required
            min="0"
            step="0.01"
            defaultValue={product?.price}
            className="mt-1"
            placeholder="29.99"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <Input
            id="stock"
            name="stock"
            type="number"
            required
            min="0"
            defaultValue={product?.stock}
            className="mt-1"
            placeholder="100"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Categories
          </label>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Edit Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Categories</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={selectedCategoryIds.includes(category.id) ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedCategories.length > 0 ? (
            selectedCategories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500">No categories selected</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images
        </label>
        <div className="space-y-2">
          {images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={image}
                onChange={(e) => updateImage(index, e.target.value)}
                placeholder="Image URL"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeImage(index)}
                className="shrink-0"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addImage}
          className="mt-2"
        >
          Add Image
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="isActive">
          {isActive ? "Product is active (online)" : "Product is inactive (draft)"}
        </Label>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
