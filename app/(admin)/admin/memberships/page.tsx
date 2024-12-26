"use client";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { getMemberships, deleteMembership } from "@/services/memberships-client";
import { getProducts } from "@/services/products-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Membership } from "@/types/membership";
import type { Product } from "@/types/product";
import { useEffect, useState } from "react";
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

type SortField = 'name' | 'duration' | 'status' | 'products';
type SortOrder = 'asc' | 'desc';

interface GetMembershipsOptions {
  status?: 'all' | 'active' | 'inactive';
  duration?: number;
  sortField?: SortField;
  sortOrder?: SortOrder;
}

interface GetProductsOptions {
  ids?: string[];
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMemberships, setTotalMemberships] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState<Membership | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | '30' | '90' | '365'>('all');
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter, durationFilter, sortField, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Pass filters to server
      const membershipData = await getMemberships(currentPage, ITEMS_PER_PAGE);
      
      let filteredMemberships = membershipData.memberships;
      
      // Apply filters
      if (statusFilter !== 'all') {
        filteredMemberships = filteredMemberships.filter(m => 
          m.isActive === (statusFilter === 'active')
        );
      }

      if (durationFilter !== 'all') {
        const duration = Number(durationFilter);
        filteredMemberships = filteredMemberships.filter(m => 
          m.duration === duration
        );
      }

      // Apply sorting
      filteredMemberships.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'duration':
            comparison = a.duration - b.duration;
            break;
          case 'status':
            comparison = Number(b.isActive) - Number(a.isActive);
            break;
          case 'products':
            comparison = a.productIds.length - b.productIds.length;
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      setMemberships(filteredMemberships);
      setTotalMemberships(filteredMemberships.length);
      setHasMore(membershipData.hasMore);
      
      // Get all unique product IDs from memberships
      const productIds = new Set<string>();
      membershipData.memberships.forEach(membership => {
        membership.productIds.forEach(id => productIds.add(id));
      });
      
      // Fetch only the needed products
      if (productIds.size > 0) {
        const productData = await getProducts(1, productIds.size, {
          ids: Array.from(productIds)
        } as GetProductsOptions);
        
        // Create a map for quick product lookups
        const newProductsMap = productData.products.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {} as Record<string, Product>);
        
        setProductsMap(newProductsMap);
      }

      setMemberships(membershipData.memberships);
      setTotalMemberships(membershipData.total);
      setHasMore(membershipData.hasMore);
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

  const handleDeleteClick = (membership: Membership) => {
    setMembershipToDelete(membership);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!membershipToDelete) return;

    try {
      await deleteMembership(membershipToDelete.id);
      setMemberships(memberships.filter((m) => m.id !== membershipToDelete.id));
      toast({
        title: "Success",
        description: "Membership deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete membership",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setMembershipToDelete(null);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Get linked products for a membership
  const getLinkedProducts = (membership: Membership) => {
    return membership.productIds
      .map(id => productsMap[id])
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Memberships"
        description="Manage your membership plans"
        action={{
          label: "Add Membership",
          href: "/admin/memberships/add",
          icon: Plus,
        }}
      />

      <div className="flex gap-4 mb-4">
        <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={durationFilter} onValueChange={(value: 'all' | '30' | '90' | '365') => setDurationFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Durations</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
            <SelectItem value="365">365 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {`${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalMemberships)}-${Math.min(currentPage * ITEMS_PER_PAGE, totalMemberships)} von ${totalMemberships} Mitgliedschaften`}
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
                        className="p-0 border-b border-neutral-100 w-[250px] cursor-pointer"
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
                        onClick={() => toggleSort('duration')}
                      >
                        <div className="pb-3.5 flex items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            Duration {sortField === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-0 border-b border-neutral-100 w-[250px] cursor-pointer"
                        onClick={() => toggleSort('products')}
                      >
                        <div className="pb-3.5 flex items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            Products {sortField === 'products' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                      <th className="p-0 border-b border-neutral-100 w-[200px]">
                        <div className="pb-3.5">
                          <span className="text-sm text-gray-400 font-medium">
                            Features
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
                      <th className="p-0 border-b border-neutral-100 w-[150px]">
                        <div className="pb-3.5"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((membership: Membership) => {
                      const linkedProducts = getLinkedProducts(membership);
                      return (
                        <tr key={membership.id}>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">
                                {membership.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {membership.description}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm">{membership.duration} days</span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <div className="flex flex-wrap gap-1">
                              {linkedProducts.map((product: Product) => (
                                <Link 
                                  key={product.id} 
                                  href={`/admin/products/${product.slug}/edit`}
                                  className="text-sm px-2 py-1 bg-primary/5 hover:bg-primary/10 rounded-full transition-colors"
                                >
                                  {product.name}
                                </Link>
                              ))}
                              {linkedProducts.length === 0 && (
                                <span className="text-sm text-gray-400">
                                  No linked products
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            {membership.features && membership.features.length > 0 ? (
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {membership.features.map((feature: string, index: number) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No features
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span
                              className={`text-sm ${
                                membership.isActive
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {membership.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 border-b border-neutral-100">
                            <div className="flex items-center space-x-2">
                              <Link href={`/admin/memberships/${membership.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/memberships/${membership.id}`} target="_blank">
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(membership)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {memberships.length === 0 && !loading && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-500">
                          No memberships found. Create your first membership to get
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
            <DialogTitle>Delete Membership</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{membershipToDelete?.name}&quot;? This action cannot be undone.
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
