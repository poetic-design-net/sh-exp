"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LandingPage } from "@/types/landing-page";
import { ExternalLink, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { deleteLandingPage, duplicateLandingPage } from "@/app/actions/landing-pages";

interface LandingPagesListProps {
  initialPages: LandingPage[];
}

export function LandingPagesList({ initialPages }: LandingPagesListProps) {
  const router = useRouter();
  const [pages, setPages] = useState<LandingPage[]>(initialPages);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<LandingPage | null>(null);
  const { toast } = useToast();

  const handleDeleteClick = (page: LandingPage) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;

    try {
      await deleteLandingPage(pageToDelete.id);
      setPages(pages.filter((p) => p.id !== pageToDelete.id));
      toast({
        title: "Success",
        description: "Landing page deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete landing page",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  const handleDuplicate = async (page: LandingPage) => {
    try {
      const duplicatedPage = await duplicateLandingPage(page.id);
      setPages([...pages, duplicatedPage]);
      toast({
        title: "Success",
        description: "Landing page duplicated successfully",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate landing page",
        variant: "destructive",
      });
    }
  };

  return (
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
                        <a className="text-sm text-gray-400 font-medium" href="#">Title</a>
                      </div>
                    </th>
                    <th className="p-0 border-b border-neutral-100">
                      <div className="pb-3.5">
                        <a className="text-sm text-gray-400 font-medium" href="#">Slug</a>
                      </div>
                    </th>
                    <th className="p-0 border-b border-neutral-100">
                      <div className="pb-3.5">
                        <a className="text-sm text-gray-400 font-medium" href="#">Last Updated</a>
                      </div>
                    </th>
                    <th className="p-0 border-b border-neutral-100">
                      <div className="pb-3.5">
                        <a className="text-sm text-gray-400 font-medium" href="#">Status</a>
                      </div>
                    </th>
                    <th className="p-0 border-b border-neutral-100">
                      <div className="pb-3.5 flex justify-end">
                        <a className="text-sm text-gray-400 font-medium" href="#">Actions</a>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id}>
                      <td className="py-3 pr-4 border-b border-neutral-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{page.title}</span>
                          <span className="text-sm text-gray-500">{page.description}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 border-b border-neutral-100">
                        <span className="text-sm">{page.slug}</span>
                      </td>
                      <td className="py-3 pr-4 border-b border-neutral-100">
                        <span className="text-sm">
                          {new Date(page.updatedAt).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-3 pr-4 border-b border-neutral-100">
                        <span className={`text-sm ${page.isActive ? "text-green-600" : "text-yellow-600"}`}>
                          {page.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 border-b border-neutral-100">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/admin/landing-pages/${page.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/l/${page.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(page)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(page)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        No landing pages found. Create your first landing page to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Landing Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{pageToDelete?.title}&quot;? This action cannot be undone.
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
