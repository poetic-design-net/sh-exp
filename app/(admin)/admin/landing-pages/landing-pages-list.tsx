"use client";

import { useState } from "react";
import type { LandingPage } from "@/types/landing-page";
import { useToast } from "@/components/ui/use-toast";
import { LandingPageCard } from "./components/landing-page-card";
import { EmptyState } from "./components/empty-state";
import { refreshLandingPages, handleDeleteLandingPage } from "./actions/landing-page-actions";

interface LandingPagesListProps {
  initialPages: LandingPage[];
}

export function LandingPagesList({ initialPages }: LandingPagesListProps) {
  const [landingPages, setLandingPages] = useState<LandingPage[]>(initialPages);
  const { toast } = useToast();

  const handleRefreshPages = async () => {
    try {
      const pages = await refreshLandingPages();
      setLandingPages(pages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh landing pages",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await handleDeleteLandingPage(id);
      toast({
        title: "Success",
        description: "Landing page deleted successfully",
      });
      handleRefreshPages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete landing page",
        variant: "destructive",
      });
    }
  };

  if (landingPages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {landingPages.map((page) => (
        <LandingPageCard
          key={page.id}
          page={page}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
