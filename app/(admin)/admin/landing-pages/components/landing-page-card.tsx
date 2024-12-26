"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import type { LandingPage } from "@/types/landing-page";

interface LandingPageCardProps {
  page: LandingPage;
  onDelete: (id: string) => Promise<void>;
}

export function LandingPageCard({ page, onDelete }: LandingPageCardProps) {
  const handleDelete = async () => {
    try {
      await onDelete(page.id);
    } catch (error) {
      console.error("Error deleting landing page:", error);
      // Here you could add toast notification for error
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h3 className="font-medium">{page.title}</h3>
        <p className="text-sm text-muted-foreground">/{page.slug}</p>
        <span
          className={`text-sm ${
            page.isActive ? "text-green-500" : "text-gray-500"
          }`}
        >
          {page.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="flex gap-2">
        <Link href={`/admin/landing-pages/${page.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
