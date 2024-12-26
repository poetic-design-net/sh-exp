"use client";

import { useEffect, useState } from "react";
import { getAllMedia, handleMediaDelete, handleMediaUpload, handleUpdateTags,handleUpdateCategory } from "app/actions/media";
import { ImageUpload } from "components/ui/image-upload";
import { MediaLibrary } from "components/ui/media-library";
import type { MediaItem } from "services/media-library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import { useToast } from "components/ui/use-toast";

export default function MediaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string>();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const mediaItems = await getAllMedia();
    setItems(mediaItems);
  };

  const onUpload = async (file: File, category: string) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      await handleMediaUpload(formData);
      await loadMedia();
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (item: MediaItem) => {
    try {
      setIsDeleting(item.id);
      await handleMediaDelete(item.id);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      await loadMedia();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(undefined);
    }
  };

  const onUpdateTags = async (id: string, tags: string[]) => {
    try {
      await handleUpdateTags(id, tags);
      await loadMedia();
      toast({
        title: "Success",
        description: "Tags updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive",
      });
    }
  };

  const onUpdateCategory = async (id: string, category: string) => {
    try {
      await handleUpdateCategory(id, category);
      await loadMedia();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">
          Manage your images and media files
        </p>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList>
          <TabsTrigger value="library">Media Library</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>
        <TabsContent value="library">
          <MediaLibrary
            items={items}
            onDelete={onDelete}
            isDeleting={isDeleting}
            onSelect={() => {}}
            onUpdateTags={onUpdateTags}
            onUpdateCategory={onUpdateCategory}
          />
        </TabsContent>
        <TabsContent value="upload">
          <ImageUpload
            onUpload={onUpload}
            isUploading={isUploading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
