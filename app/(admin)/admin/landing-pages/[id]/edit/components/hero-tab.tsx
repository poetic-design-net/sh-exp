"use client";

import { useEffect, useState, useCallback } from "react";
import { MediaField } from "@/components/admin/shared/media-field";
import { getAllMedia } from "@/app/actions/media";
import type { MediaItem } from "@/services/media-library";

interface HeroTabProps {
  heroProps: Record<string, any>;
  onFieldChange: (field: string, value: any) => void;
}

export function HeroTab({ heroProps, onFieldChange }: HeroTabProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const loadMedia = async () => {
      const items = await getAllMedia();
      setMediaItems(items);
    };
    loadMedia();
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    onFieldChange(`hero.${field}`, value);
  }, [onFieldChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title Bold</label>
        <input
          type="text"
          value={heroProps?.titleBold || ''}
          onChange={(e) => handleChange('titleBold', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Title Normal</label>
        <input
          type="text"
          value={heroProps?.titleNormal || ''}
          onChange={(e) => handleChange('titleNormal', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Subtitle</label>
        <input
          type="text"
          value={heroProps?.subtitle || ''}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Top Banner Text</label>
        <input
          type="text"
          value={heroProps?.topBannerText || ''}
          onChange={(e) => handleChange('topBannerText', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={heroProps?.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">CTA Text</label>
        <input
          type="text"
          value={heroProps?.ctaText || ''}
          onChange={(e) => handleChange('ctaText', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">CTA Link</label>
        <input
          type="text"
          value={heroProps?.ctaLink || ''}
          onChange={(e) => handleChange('ctaLink', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Background Image</label>
        <MediaField
          value={heroProps?.backgroundImage || ''}
          onChange={(value) => handleChange('backgroundImage', value)}
          items={mediaItems}
        />
      </div>
    </div>
  );
}
