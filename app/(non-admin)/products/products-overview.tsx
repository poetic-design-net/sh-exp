"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductGrid from "./product-grid";

interface ProductsOverviewProps {
  products: Product[];
  categories: Category[];
}

type SortOption = "name" | "price-asc" | "price-desc";
type FilterOption = "all" | "subscription" | "one-time";

export default function ProductsOverview({ products = [], categories = [] }: ProductsOverviewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Sort products based on selected option
  const sortProducts = (products: Product[]) => {
    switch (sortBy) {
      case "name":
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case "price-asc":
        return [...products].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...products].sort((a, b) => b.price - a.price);
      default:
        return products;
    }
  };

  // Filter products by type (subscription/one-time)
  const filterByType = (products: Product[]) => {
    switch (filterBy) {
      case "subscription":
        return products.filter(product => product.isSubscription);
      case "one-time":
        return products.filter(product => !product.isSubscription);
      default:
        return products;
    }
  };

  // Filter products by category
  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.categoryIds?.includes(selectedCategory));

  // Apply type filter and sort
  const sortedProducts = sortProducts(filterByType(filteredProducts));

  // Group products by category for the "all" view
  const productsByCategory = categories.reduce((acc, category) => {
    const categoryProducts = filterByType(products.filter(product => 
      product.categoryIds?.includes(category.id)
    ));
    if (categoryProducts.length > 0) {
      acc[category.id] = categoryProducts;
    }
    return acc;
  }, {} as Record<string, Product[]>);

  // Get uncategorized products
  const uncategorizedProducts = filterByType(products.filter(product => 
    !product.categoryIds || product.categoryIds.length === 0
  ));

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 mb-12">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterBy}
              onValueChange={(value) => setFilterBy(value as FilterOption)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Produkttyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Produkte</SelectItem>
                <SelectItem value="subscription">Abonnements</SelectItem>
                <SelectItem value="one-time">Einmalige Käufe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sortierung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-asc">Preis (aufsteigend)</SelectItem>
              <SelectItem value="price-desc">Preis (absteigend)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCategory === "all" ? (
        <div className="space-y-16">
          {categories.map((category) => {
            const categoryProducts = productsByCategory[category.id];
            if (!categoryProducts?.length) return null;
            
            return (
              <section key={category.id} className="space-y-4">
                <div className="container mx-auto">
                  <div className="relative px-4">
                    <h2 className="text-2xl font-semibold">
                      {category.name}
                    </h2>
                    <ProductGrid products={sortProducts(categoryProducts)} />
                  </div>
                </div>
              </section>
            );
          })}
          
          {uncategorizedProducts.length > 0 && (
            <section className="space-y-4">
              <div className="container mx-auto">
                <div className="relative px-4">
                  <h2 className="text-2xl font-semibold">
                    Sonstige Produkte
                  </h2>
                  <ProductGrid products={sortProducts(uncategorizedProducts)} />
                </div>
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="container mx-auto">
          <div className="relative px-4">
            <ProductGrid products={sortedProducts} />
          </div>
        </div>
      )}
    </div>
  );
}
