"use client";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { getProducts, deleteProduct } from "@/services/products-client";
import { getMemberships } from "@/services/memberships-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice, cleanHtml } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import type { Membership } from "@/types/membership";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

type SortField = 'name' | 'price' | 'status' | 'category' | 'memberships';
type SortOrder = 'asc' | 'desc';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [productMembershipsMap, setProductMembershipsMap] = useState<Map<string, Membership[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMembership, setSelectedMembership] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [currentPage, selectedCategory, selectedMembership, sortField, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      // First get all data we need
      const [membershipsData, allProductsData, currentPageData] = await Promise.all([
        getMemberships(1, 100, true), // Load all memberships
        getProducts(1, 1000), // Load all products to check memberships
        getProducts(currentPage, ITEMS_PER_PAGE) // Load current page for display
      ]);

      let filteredProducts = currentPageData.products;
      
      // Filter by category if selected
      if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.categories?.some(c => c.id === selectedCategory)
        );
      }

      // Create a Set of all valid product IDs for efficient lookups
      const allProductIds = new Set(allProductsData.products.map(p => p.id));

      // Create maps for both directions of the relationship
      const membershipToProductsMap = new Map<string, Set<string>>();
      const newProductMembershipsMap = new Map<string, Membership[]>();

      // First create the membership to products map for ALL products
      membershipsData.memberships.forEach((membership: Membership) => {
        if (Array.isArray(membership.productIds)) {
          // Use Set intersection to find valid product IDs efficiently
          const validProductIds = membership.productIds.filter(id => allProductIds.has(id));
          if (validProductIds.length > 0) {
            membershipToProductsMap.set(membership.id, new Set(validProductIds));
          }
        }
      });

      // Filter to only include memberships that have actual valid product connections
      const validMemberships = membershipsData.memberships.filter(membership => {
        const validProducts = membershipToProductsMap.get(membership.id);
        return validProducts && validProducts.size > 0;
      });

      // Second pass: Create product to memberships map for current page
      filteredProducts.forEach(product => {
        const productMemberships = validMemberships.filter(membership => 
          membershipToProductsMap.get(membership.id)?.has(product.id)
        );
        if (productMemberships.length > 0) {
          newProductMembershipsMap.set(product.id, productMemberships);
        }
      });

      setMemberships(validMemberships);

      // Debug log
      console.log('Maps:', {
        membershipToProducts: Object.fromEntries(membershipToProductsMap),
        productToMemberships: Object.fromEntries(newProductMembershipsMap)
      });

      // Filter by membership if selected
      if (selectedMembership !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
          const productMemberships = newProductMembershipsMap.get(product.id) || [];
          return productMemberships.some(m => m.id === selectedMembership);
        });
      }

      setProductMembershipsMap(newProductMembershipsMap);

      // Debug log
      console.log('Memberships data:', {
        all: membershipsData.memberships,
        valid: validMemberships,
        membershipMap: membershipToProductsMap,
        productMap: newProductMembershipsMap
      });

      // Sort products
      filteredProducts.sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'status':
            comparison = Number(b.isActive) - Number(a.isActive);
            break;
          case 'category':
            const aCategory = a.categories?.[0]?.name || '';
            const bCategory = b.categories?.[0]?.name || '';
            comparison = aCategory.localeCompare(bCategory);
            break;
          case 'memberships':
            const aMemberships = productMembershipsMap.get(a.id)?.length || 0;
            const bMemberships = productMembershipsMap.get(b.id)?.length || 0;
            comparison = aMemberships - bMemberships;
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      setProducts(filteredProducts);
      // Set total count from all products data
      setTotalProducts(allProductsData.total);
      // Calculate if there are more pages based on the total count
      const lastPossiblePage = Math.ceil(allProductsData.total / ITEMS_PER_PAGE);
      setHasMore(currentPage < lastPossiblePage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Get unique categories from products
  const categories = Array.from(new Set(products.flatMap(p => p.categories?.map(c => c.id) || []))).map(id => {
    const category = products.find(p => p.categories?.find(c => c.id === id))?.categories?.find(c => c.id === id);
    return category;
  }).filter(Boolean);

  // Get memberships that grant access to a product
  const getProductMemberships = (product: Product): Membership[] => {
    return productMembershipsMap.get(product.id) || [];
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your products"
        action={{
          label: "Add Product",
          href: "/admin/products/add",
          icon: Plus,
        }}
      />

      <div className="flex gap-4 mb-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category?.id} value={category?.id || ''}>
                {category?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMembership} onValueChange={setSelectedMembership}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Memberships</SelectItem>
            {memberships.map(membership => (
                <SelectItem key={membership.id} value={membership.id}>
                  {membership.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {totalProducts === 0 ? (
            'Keine Produkte'
          ) : (
            `${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalProducts)}-${Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} von ${totalProducts} Produkten`
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(prev => Math.max(1, prev - 1));
            }}
            disabled={currentPage === 1}
          >
            Vorherige
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage(prev => prev + 1);
            }}
            disabled={!hasMore}
          >
            Nächste
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="mx-auto">
          <div className="pt-5 bg-white border border-neutral-100 rounded-xl">
            <div className="px-6">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="text-left">
                      <th 
                        className="p-0 border-b border-neutral-100 w-[300px] cursor-pointer"
                        onClick={() => toggleSort('name')}
                      >
                        <div className="pb-3.5 flex items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-0 border-b border-neutral-100 w-[120px] cursor-pointer"
                        onClick={() => toggleSort('price')}
                      >
                        <div className="pb-3.5 flex items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            Price {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-0 border-b border-neutral-100 w-[100px] cursor-pointer"
                        onClick={() => toggleSort('status')}
                      >
                        <div className="pb-3.5 flex items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-0 border-b border-neutral-100 w-[150px] cursor-pointer"
                        onClick={() => toggleSort('category')}
                      >
                        <div className="pb-3.5 flex items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            Category {sortField === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-0 border-b border-neutral-100 w-[200px] cursor-pointer"
                        onClick={() => toggleSort('memberships')}
                      >
                        <div className="pb-3.5 flex items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            Memberships {sortField === 'memberships' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                      <th className="p-0 border-b border-neutral-100 w-[100px]">
                        <div className="pb-3.5">
                          <span className="text-sm text-gray-400 font-medium">
                            Image
                          </span>
                        </div>
                      </th>
                      <th className="p-0 border-b border-neutral-100 w-[150px]">
                        <div className="pb-3.5"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const productMemberships = getProductMemberships(product);
                      return (
                        <tr key={product.id}>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <div className="flex flex-col max-w-[300px]">
                              <span className="text-sm font-semibold">
                                {product.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {truncateText(cleanHtml(product.description), 100)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm font-medium">
                              {formatPrice(product.price)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span
                              className={`text-sm ${
                                product.isActive
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <div className="flex flex-wrap gap-1">
                              {product.categories?.map((category) => (
                                <span
                                  key={category.id}
                                  className="text-sm px-2 py-1 bg-gray-100 rounded-full"
                                >
                                  {category.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <div className="flex flex-wrap gap-1">
                              {productMemberships.map((membership: Membership) => (
                                <Link
                                  key={membership.id}
                                  href={`/admin/memberships/${membership.id}/edit`}
                                  className="text-sm px-2 py-1 bg-primary/5 hover:bg-primary/10 rounded-full transition-colors"
                                >
                                  {membership.name}
                                </Link>
                              ))}
                              {productMemberships.length === 0 && (
                                <span className="text-sm text-gray-400">
                                  No memberships
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            {product.images && product.images[0] ? (
                              <div className="w-12 h-12">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No image
                              </span>
                            )}
                          </td>
                          <td className="py-3 border-b border-neutral-100">
                            <div className="flex items-center space-x-2">
                              <Link href={`/admin/products/${product.slug}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/products/${product.slug}`} target="_blank">
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(product)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && !loading && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-gray-500">
                          No products found. Create your first product to get
                          started.
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
