"use client";

import { useState } from "react";
import { MediaPicker } from "@/components/ui/media-picker";
import { handleMediaUpload, handleMediaDelete } from "@/app/actions/media";
import type { MediaItem } from "@/services/media-library";

interface MediaFieldProps {
  value?: string;
  onChange: (value: string) => void;
  items: MediaItem[];
}

export function MediaField({ value, onChange, items }: MediaFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string>();
  const [currentValue, setCurrentValue] = useState(value);

  const onUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const item = await handleMediaUpload(formData);
      onChange(item.url); // Only trigger onChange after successful upload
      return item;
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (item: MediaItem) => {
    try {
      setIsDeleting(item.id);
      await handleMediaDelete(item.id);
      // If the deleted image was selected, clear the value
      if (value === item.url) {
        onChange("");
      }
    } finally {
      setIsDeleting(undefined);
    }
  };

  const handleImageSelect = (url: string) => {
    setCurrentValue(url);
    onChange(url); // Only trigger onChange when image is actually selected
  };

  return (
    <MediaPicker
      value={currentValue}
      onChange={handleImageSelect}
      onUpload={onUpload}
      onDelete={onDelete}
      items={items}
      isUploading={isUploading}
      isDeleting={isDeleting}
    />
  );
}
