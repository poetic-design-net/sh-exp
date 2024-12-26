"use client";

import { getFunnels, deleteFunnel } from "@/app/actions/funnels";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { Funnel } from "@/types/funnel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type SortField = 'name' | 'status' | 'conversionRate';
type SortOrder = 'asc' | 'desc';

export default function AdminFunnelsPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<Funnel | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const funnelsData = await getFunnels();
      setFunnels(funnelsData);
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

  const handleDeleteClick = (funnel: Funnel) => {
    setFunnelToDelete(funnel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!funnelToDelete) return;

    try {
      await deleteFunnel(funnelToDelete.id);
      setFunnels(funnels.filter((f) => f.id !== funnelToDelete.id));
      toast({
        title: "Success",
        description: "Funnel deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete funnel",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setFunnelToDelete(null);
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

  // Sort funnels
  const sortedFunnels = [...funnels].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        comparison = Number(b.isActive) - Number(a.isActive);
        break;
      case 'conversionRate':
        comparison = (a.analytics?.conversionRate || 0) - (b.analytics?.conversionRate || 0);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verkaufstrichter"
        description="Verwalten Sie Ihre Verkaufstrichter"
        action={{
          label: "Neuen Trichter erstellen",
          href: "/admin/funnels/new",
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
                        onClick={() => toggleSort('conversionRate')}
                      >
                        <div className="pb-3.5 flex items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            Konversionsrate {sortField === 'conversionRate' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </span>
                        </div>
                      </th>
                      <th className="p-0 border-b border-neutral-100 w-[150px]">
                        <div className="pb-3.5"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFunnels.map((funnel) => (
                      <tr key={funnel.id}>
                        <td className="py-3 pr-4 border-b border-neutral-100">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {funnel.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              /angebot/{funnel.slug}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 border-b border-neutral-100">
                          <span
                            className={`text-sm ${
                              funnel.isActive
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {funnel.isActive ? "Aktiv" : "Inaktiv"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 border-b border-neutral-100">
                          <span className="text-sm font-medium">
                            {funnel.analytics.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 border-b border-neutral-100">
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin/funnels/${funnel.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Bearbeiten
                              </Button>
                            </Link>
                            <Link href={`/angebot/${funnel.slug}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(funnel)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sortedFunnels.length === 0 && !loading && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">
                          Keine Verkaufstrichter gefunden. Erstellen Sie Ihren ersten Trichter, um loszulegen.
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
            <DialogTitle>Verkaufstrichter löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie den Verkaufstrichter &quot;{funnelToDelete?.name}&quot; löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
