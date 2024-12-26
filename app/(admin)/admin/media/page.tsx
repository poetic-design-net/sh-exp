"use client";

import { useEffect, useState } from "react";
import { deleteMedia, getMediaItems, updateMediaTags, updateMediaCategory } from "app/actions/media";
import { ImageUpload } from "components/ui/image-upload";
import { MediaLibrary } from "components/ui/media-library";
import type { MediaItem } from "services/server/media-library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import { useToast } from "components/ui/use-toast";

export default function MediaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string>();

  useEffect(() => {
    loadMedia(currentPage);
  }, [currentPage]);

  const loadMedia = async (page: number) => {
    const result = await getMediaItems({ page, limit: 20 });
    setItems(result.items);
    setTotal(result.total);
  };

  const onUpload = async (file: File, category: string) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Upload failed');
      await loadMedia(currentPage);
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
      await deleteMedia(item.id);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      await loadMedia(currentPage);
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
      await updateMediaTags(id, tags);
      await loadMedia(currentPage);
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
      await updateMediaCategory(id, category);
      await loadMedia(currentPage);
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
            total={total}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
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
