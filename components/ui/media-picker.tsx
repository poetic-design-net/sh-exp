"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { MediaItem } from "@/services/server/media-library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Loader2, Image, Video, Music, File, Info } from 'lucide-react';
import { ContentType } from 'types/membership-page';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, filename: string) => void;
  multiple?: boolean;
}

interface MediaDetailsDialogProps {
  item: MediaItem | null;
  onClose: () => void;
}

function MediaDetailsDialog({ item, onClose }: MediaDetailsDialogProps) {
  if (!item) return null;

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bilddetails</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <img
              src={item.url}
              alt={item.filename}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Dateiname</h3>
            <p className="text-sm text-muted-foreground">{item.filename}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Größe</h3>
              <p className="text-sm text-muted-foreground">{formatSize(item.size)}</p>
            </div>
            <div>
              <h3 className="font-medium">Typ</h3>
              <p className="text-sm text-muted-foreground">{item.contentType}</p>
            </div>
            {item.width && item.height && (
              <div className="col-span-2">
                <h3 className="font-medium">Abmessungen</h3>
                <p className="text-sm text-muted-foreground">{item.width} × {item.height} Pixel</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MediaPicker({ open, onClose, onSelect, multiple = false }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (open) {
      loadMediaItems();
    }
  }, [open]);

  const loadMediaItems = async () => {
    try {
      const response = await fetch('/api/media');
      const data = await response.json();
      console.log('Loaded media items:', data.map((item: MediaItem) => ({
        filename: item.filename,
        url: item.url,
        contentType: item.contentType
      })));
      setItems(data);
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMediaType = (filename: string): ContentType => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    }
    if (['mp4', 'webm', 'mov'].includes(extension)) {
      return 'video';
    }
    if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return 'audio';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    return 'image';
  };

  const getMediaIcon = (filename: string) => {
    const type = getMediaType(filename);
    switch (type) {
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'audio':
        return <Music className="h-6 w-6" />;
      case 'pdf':
        return <File className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  const handleUpload = async (file: File, category: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      console.log('Upload result:', result);

      await loadMediaItems();
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      setSelectedUrls(prev => {
        const newUrls = prev.includes(item.url)
          ? prev.filter(u => u !== item.url)
          : [...prev, item.url];
        return newUrls;
      });
    } else {
      onSelect(item.url, item.filename);
      onClose();
    }
  };

  const handleConfirm = () => {
    if (multiple && selectedUrls.length > 0) {
      onSelect(selectedUrls.join(','), '');
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Mediathek</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="browse">
            <TabsList>
              <TabsTrigger value="browse">Durchsuchen</TabsTrigger>
              <TabsTrigger value="upload">Hochladen</TabsTrigger>
            </TabsList>
            <TabsContent value="browse">
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {items.map((item) => {
                      const mediaType = getMediaType(item.filename);
                      return (
                        <div
                          key={item.id}
                          className="relative aspect-square rounded-lg overflow-hidden"
                        >
                          <div
                            className={`
                              absolute inset-0 cursor-pointer
                              hover:ring-2 hover:ring-primary
                              ${selectedUrls.includes(item.url) ? 'ring-2 ring-primary' : ''}
                              bg-gray-100 flex items-center justify-center
                            `}
                            onClick={() => handleSelect(item)}
                          >
                            {mediaType === 'image' ? (
                              <img
                                src={item.url}
                                alt={item.filename}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                {getMediaIcon(item.filename)}
                                <span className="text-sm text-gray-600">{item.filename}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          {selectedUrls.includes(item.url) && (
                            <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              {multiple && (
                <div className="flex justify-end mt-4">
                  <Button onClick={handleConfirm} disabled={selectedUrls.length === 0}>
                    {selectedUrls.length} Dateien auswählen
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="upload">
              <div className="p-4">
                <ImageUpload
                  onUpload={handleUpload}
                  isUploading={isUploading}
                />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <MediaDetailsDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
