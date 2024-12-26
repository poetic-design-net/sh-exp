"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaField } from "@/components/admin/shared/media-field";
import { getAllMedia } from "@/app/actions/media";
import type { LandingPage } from "@/types/landing-page";
import type { MediaItem } from "@/services/media-library";

interface BasicInfoTabProps {
  landingPage: LandingPage;
  onFieldChange: (field: string, value: any) => void;
}

export function BasicInfoTab({ landingPage, onFieldChange }: BasicInfoTabProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const loadMedia = async () => {
      const items = await getAllMedia();
      setMediaItems(items);
    };
    loadMedia();
  }, []);

  const handleMetadataChange = useCallback((field: string, value: string) => {
    onFieldChange("metadata", {
      ...landingPage.metadata,
      [field]: value
    });
  }, [landingPage.metadata, onFieldChange]);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={landingPage.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={landingPage.slug}
            onChange={(e) => onFieldChange("slug", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={landingPage.description || ""}
          onChange={(e) => onFieldChange("description", e.target.value)}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={landingPage.isActive}
            onChange={(e) => onFieldChange("isActive", e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">SEO Settings</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              value={landingPage.metadata?.seoTitle || ""}
              onChange={(e) => handleMetadataChange("seoTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Input
              id="seoDescription"
              value={landingPage.metadata?.seoDescription || ""}
              onChange={(e) => handleMetadataChange("seoDescription", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ogImage">OG Image</Label>
            <MediaField
              value={landingPage.metadata?.ogImage || ""}
              onChange={(value) => handleMetadataChange("ogImage", value)}
              items={mediaItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
