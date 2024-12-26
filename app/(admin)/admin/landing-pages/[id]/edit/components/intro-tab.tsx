"use client";

import { useEffect, useState } from "react";
import { MediaField } from "@/components/admin/shared/media-field";
import { getAllMedia } from "@/app/actions/media";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { MediaItem } from "@/services/media-library";

interface IntroTabProps {
  introProps: Record<string, any>;
  onFieldChange: (field: string, value: any) => void;
}

export function IntroTab({ introProps, onFieldChange }: IntroTabProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const loadMedia = async () => {
      const items = await getAllMedia();
      setMediaItems(items);
    };
    loadMedia();
  }, []);

  const handleChange = (field: string, value: any) => {
    onFieldChange(`intro.${field}`, value);
  };

  const handleStatsChange = (field: string, value: string) => {
    const newStats = { ...introProps.stats, [field]: value };
    handleChange('stats', newStats);
  };

  const handleProgramOverviewChange = (field: string, value: string) => {
    const newProgramOverview = { ...(introProps.programOverview || {}), [field]: value };
    handleChange('programOverview', newProgramOverview);
  };

  const addFeature = () => {
    const newFeatures = [...(introProps.features || []), { 
      title: '',
      backTitle: '',
      backSubtitle: 'Entdecken Sie',
      backDescription: '',
      bgImage: ''
    }];
    handleChange('features', newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(introProps.features || [])];
    newFeatures.splice(index, 1);
    handleChange('features', newFeatures);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...(introProps.features || [])];
    newFeatures[index] = { 
      ...newFeatures[index],
      [field]: value 
    };
    handleChange('features', newFeatures);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <input
          type="text"
          value={introProps?.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Stats</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Value</label>
          <input
            type="text"
            value={introProps?.stats?.value || ''}
            onChange={(e) => handleStatsChange('value', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <input
            type="text"
            value={introProps?.stats?.description || ''}
            onChange={(e) => handleStatsChange('description', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Features</h3>
          <button
            type="button"
            onClick={addFeature}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Feature
          </button>
        </div>
        
        {(introProps?.features || []).map((feature: any, index: number) => (
          <div key={index} className="space-y-4 p-4 border rounded">
            {/* Front Side Content */}
            <div className="space-y-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium">Front Side</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={feature.title || ''}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Background Image</label>
                <MediaField
                  value={feature.bgImage || ''}
                  onChange={(value) => updateFeature(index, 'bgImage', value)}
                  items={mediaItems}
                />
              </div>
            </div>

            {/* Back Side Content */}
            <div className="space-y-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium">Back Side</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subtitle</label>
                <input
                  type="text"
                  value={feature.backSubtitle || ''}
                  onChange={(e) => updateFeature(index, 'backSubtitle', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Entdecken Sie"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={feature.backTitle || ''}
                  onChange={(e) => updateFeature(index, 'backTitle', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <RichTextEditor
                  value={feature.backDescription || ''}
                  onChange={(value) => updateFeature(index, 'backDescription', value)}
                  minHeight={150}
                  placeholder="Enter description..."
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove Feature
            </button>
          </div>
        ))}
      </div>

      {/* Program Overview Section */}
      <div className="space-y-4 p-4 border rounded">
        <h3 className="font-medium">Program Overview</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            value={introProps?.programOverview?.title || ''}
            onChange={(e) => handleProgramOverviewChange('title', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Program Overview"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Subtitle</label>
          <input
            type="text"
            value={introProps?.programOverview?.subtitle || ''}
            onChange={(e) => handleProgramOverviewChange('subtitle', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Exclusive Offers For You"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <RichTextEditor
            value={introProps?.programOverview?.description || ''}
            onChange={(value) => handleProgramOverviewChange('description', value)}
            minHeight={150}
            placeholder="With the INTENSIVE TRAINING you get direct contact with Stefan Hiene..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Button Text</label>
          <input
            type="text"
            value={introProps?.programOverview?.buttonText || ''}
            onChange={(e) => handleProgramOverviewChange('buttonText', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Check Event List"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Button Link</label>
          <input
            type="text"
            value={introProps?.programOverview?.buttonLink || ''}
            onChange={(e) => handleProgramOverviewChange('buttonLink', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="/admin/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
