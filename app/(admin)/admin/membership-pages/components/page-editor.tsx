"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { RichTextEditor } from "components/ui/rich-text-editor";
import { MediaPicker } from "components/ui/media-picker";
import { Plus } from "lucide-react";
import { useToast } from "components/ui/use-toast";
import { ContentItem, ContentType } from "types/membership-page";
import { generateSlug } from "lib/utils/slug";
import { updateMembershipPage } from "app/actions/membership-pages";

interface PageEditorProps {
  initialPage: {
    id: string;
    title: string;
    content: {
      description?: string;
      items: ContentItem[];
    };
  };
}

export function PageEditor({ initialPage }: PageEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'image-grid' | null>(null);

  const handleUpdateContent = (itemId: string, updates: Partial<ContentItem>) => {
    setPage(prevPage => ({
      ...prevPage,
      content: {
        ...prevPage.content,
        items: prevPage.content.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      }
    }));
  };

  const handleAddContent = (type: ContentType) => {
    const newItem: ContentItem = {
      id: crypto.randomUUID(),
      type,
      title: '',
      content: '',
      order: page.content.items.length,
      ...(type === 'image-grid' ? { images: [] } : {})
    };

    setPage(prevPage => ({
      ...prevPage,
      content: {
        ...prevPage.content,
        items: [...prevPage.content.items, newItem]
      }
    }));
    setEditingItemId(newItem.id);
  };

  const handleMediaSelect = (url: string) => {
    if (editingItemId) {
      const editingItem = page.content.items.find(item => item.id === editingItemId);
      if (!editingItem) return;

      if (editingItem.type === 'image-grid') {
        handleUpdateContent(editingItemId, {
          images: [...(editingItem.images || []), url]
        });
      } else {
        handleUpdateContent(editingItemId, { content: url });
      }
    } else {
      // Neue Medien hinzufügen
      const type = mediaType || 'image';
      const newItem: ContentItem = {
        id: crypto.randomUUID(),
        type,
        title: '',
        content: url,
        order: page.content.items.length,
        ...(type === 'image-grid' ? { images: [url] } : {})
      };

      setPage(prevPage => ({
        ...prevPage,
        content: {
          ...prevPage.content,
          items: [...prevPage.content.items, newItem]
        }
      }));
    }

    setIsMediaPickerOpen(false);
    setEditingItemId(null);
    setMediaType(null);
  };

  const handleSave = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const updatedPage = await updateMembershipPage(page.id, {
        ...page,
        slug: generateSlug(page.title)
      });
      setPage(updatedPage);
      toast({
        title: "Erfolgreich gespeichert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (item: ContentItem) => {
    switch (item.type) {
      case "text":
        return (
          <RichTextEditor
            value={item.content}
            onChange={(value) =>
              handleUpdateContent(item.id, {
                content: value,
              })
            }
          />
        );
      case "video-embed":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={item.content}
                onChange={(e) => handleUpdateContent(item.id, { content: e.target.value })}
                placeholder="Video-ID oder URL eingeben (YouTube oder Vimeo)"
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Beispiele:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>YouTube Video-ID: dQw4w9WgXcQ</li>
                <li>YouTube URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
                <li>Vimeo Video-ID: 123456789</li>
                <li>Vimeo URL: https://vimeo.com/123456789</li>
              </ul>
            </div>
          </div>
        );
      case "image-grid":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {item.images?.map((imageUrl, imageIndex) => (
                <div key={imageIndex} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      const newImages = item.images?.filter((_, i) => i !== imageIndex);
                      handleUpdateContent(item.id, { images: newImages });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              <Button
                onClick={() => {
                  setEditingItemId(item.id);
                  setMediaType('image-grid');
                  setIsMediaPickerOpen(true);
                }}
                variant="outline"
                className="aspect-square flex flex-col items-center justify-center"
              >
                <Plus className="w-6 h-6 mb-2" />
                Bild hinzufügen
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              value={item.content}
              readOnly
              placeholder={`${item.type} URL oder Datei auswählen`}
            />
            <Button
              onClick={() => {
                setEditingItemId(item.id);
                setIsMediaPickerOpen(true);
              }}
            >
              Auswählen
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Speichert..." : "Speichern"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Inhalte</h2>
          <div className="flex gap-2">
            <Button onClick={() => handleAddContent('text')} variant="outline">
              Text hinzufügen
            </Button>
            <Button onClick={() => handleAddContent('video-embed')} variant="outline">
              Video einbetten
            </Button>
            <Button 
              onClick={() => {
                setMediaType('image-grid');
                handleAddContent('image-grid');
              }} 
              variant="outline"
            >
              Bildergalerie
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {page.content.items
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm">
                <div className="space-y-4">
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      handleUpdateContent(item.id, {
                        title: e.target.value,
                      })
                    }
                    placeholder="Titel eingeben"
                  />
                  {renderContent(item)}
                </div>
              </div>
            ))}
        </div>
      </div>

      <MediaPicker
        open={isMediaPickerOpen}
        onSelect={handleMediaSelect}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setEditingItemId(null);
          setMediaType(null);
        }}
      />
    </div>
  );
}
